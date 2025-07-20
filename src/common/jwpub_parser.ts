import JSZip from 'jszip';
import initSqlJs, { Database } from 'sql.js';
import { inflate } from 'pako';
import { HTMLElement } from 'node-html-parser';

import { MWBSchedule, WSchedule } from '../types';
import { extractZipFiles } from './jszip_lib';
import { getPubLanguage, getPubYear, isMWBPub, isWPub } from './file_validation';
import { getWStudyArticles, parseMWB, parseWSchedule } from './html_utils';
import { HTMLParse } from './html_validation';

type StudyArticle = { id: number; article: HTMLElement };

type WPubContents = { toc: HTMLElement; articles: StudyArticle[] };

const getDatabaseFile = async (zip: JSZip) => {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  const SQL = await initSqlJs(
    isBrowser ? { wasmBinary: await fetch('./sql-wasm.wasm').then((res) => res.arrayBuffer()) } : {}
  );

  const contentZip = await zip.files['contents'].async('uint8array');
  const innerZip = await extractZipFiles(contentZip);

  const dbFile = Object.keys(innerZip.files).find((file) => file.endsWith('.db'));

  if (!dbFile) {
    throw new Error('Database file not found in the JWPUB file.');
  }

  const sqlDb = await innerZip.files[dbFile].async('uint8array');
  const db = new SQL.Database(sqlDb);

  return db;
};

const hexToBytes = (hex: string) => {
  const clean = hex.replace(/[^a-fA-F0-9]/g, '');
  const bytes = new Uint8Array(clean.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }

  return bytes;
};

const bufferToHex = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);

  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const generateSHA256Rounds = async (text: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
};

const xorBuffers = (buf1: Uint8Array<ArrayBuffer>, buf2: Uint8Array<ArrayBuffer>) => {
  if (buf1.length !== buf2.length) {
    throw new Error('Buffers must be same length');
  }

  return buf1.map((byte, i) => byte ^ buf2[i % buf2.length]);
};

const bytesToHex = (bytes: Uint8Array) => {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const hashAndXor = async (inputText: string, xorKeyHex: string) => {
  const hashHex = await generateSHA256Rounds(inputText);
  const hashBytes = hexToBytes(hashHex);
  const keyBytes = hexToBytes(xorKeyHex);

  const xored = xorBuffers(hashBytes, keyBytes);
  return bytesToHex(xored);
};

const decryptAES128CBC = async (data: BufferSource, key: string, iv: string) => {
  const cryptoKey = await crypto.subtle.importKey('raw', hexToBytes(key), { name: 'AES-CBC' }, false, ['decrypt']);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: hexToBytes(iv) }, cryptoKey, data);
  return decrypted;
};

const getRawContent = async (data: BufferSource, key: string, iv: string) => {
  const decryptedContent = await decryptAES128CBC(data, key, iv);

  const compressed = new Uint8Array(decryptedContent);
  const decompressed = inflate(compressed);
  const text = new TextDecoder().decode(decompressed);

  return text;
};

const getPubCard = (db: Database) => {
  const publicationTable = db.exec('SELECT MepsLanguageIndex, Symbol, Year, IssueTagNumber FROM Publication');

  if (publicationTable.length === 0) {
    throw new Error('The file selected is not a valid JWPUB file.');
  }

  return publicationTable[0].values[0].join('_');
};

const getPubKeyIv = async (pubCard: string) => {
  const key = atob('MTFjYmI1NTg3ZTMyODQ2ZDRjMjY3OTBjNjMzZGEyODlmNjZmZTU4NDJhM2E1ODVjZTFiYzNhMjk0YWY1YWRhNw==');

  const pubHashKey = await hashAndXor(pubCard, key);

  return { key: pubHashKey.slice(0, 32), iv: pubHashKey.slice(32) };
};

const getMWBDocs = async (db: Database, key: string, iv: string) => {
  const files: HTMLElement[] = [];

  const data = db.exec(`SELECT Content FROM Document WHERE Class='106'`);

  for (const row of data.at(0)!.values) {
    const content = row.at(0) as BufferSource;
    const text = await getRawContent(content, key, iv);
    const htmlDoc = HTMLParse(text);

    htmlDoc.querySelectorAll('rt').forEach((rt) => rt.remove());

    files.push(htmlDoc);
  }

  return files;
};

const getWDocs = async (db: Database, key: string, iv: string) => {
  const articles: StudyArticle[] = [];

  // TOC
  let data = db.exec(`SELECT Content FROM Document WHERE Class='68'`);

  const tocRow = data.at(0)!.values.at(0)!;
  const tocContent = tocRow.at(0) as BufferSource;
  const text = await getRawContent(tocContent, key, iv);
  const htmlToc = HTMLParse(text);
  htmlToc.querySelectorAll('rt').forEach((rt) => rt.remove());

  // Articles
  data = db.exec(`SELECT MepsDocumentId, Content FROM Document WHERE Class='40'`);
  for (const row of data.at(0)!.values) {
    const id = +row.at(0)!;
    const content = row.at(1) as BufferSource;
    const text = await getRawContent(content, key, iv);
    const article = HTMLParse(text);

    article.querySelectorAll('rt').forEach((rt) => rt.remove());

    articles.push({ id, article });
  }

  return { toc: htmlToc, articles } as WPubContents;
};

const getHTMLDocs = async (zip: JSZip, isMWB: boolean, isW: boolean) => {
  const db = await getDatabaseFile(zip);
  const pubCard = getPubCard(db);

  const { key, iv } = await getPubKeyIv(pubCard);

  if (isMWB) {
    const mwbFiles = await getMWBDocs(db, key, iv);
    return mwbFiles;
  }

  if (isW) {
    const wFiles = await getWDocs(db, key, iv);
    return wFiles;
  }
};

const getHTMLWTArticleDoc = async (id: number, articles: StudyArticle[]) => {
  return articles.find((article) => article.id === id)!.article;
};

const parseWJwpub = async ({
  htmlItem,
  htmlDocs,
  lang,
}: {
  htmlItem: HTMLElement;
  htmlDocs: StudyArticle[];
  lang: string;
}) => {
  const weeksData = [];

  const studyArticles = getWStudyArticles(htmlItem);

  for (const [_, studyArticle] of studyArticles.entries()) {
    const href = studyArticle.nextElementSibling!.querySelector('a')!.getAttribute('href') as string;

    const groups = Array.from(/(?:.*)+:(\w+)\/$/.exec(href)!);
    const articleId = +groups[1];

    const content = await getHTMLWTArticleDoc(+articleId, htmlDocs);

    const weekItem = parseWSchedule(studyArticle, content, lang);
    weeksData.push(weekItem);
  }

  return weeksData;
};

export const parseJWPUB = async (filename: string, input: string | ArrayBuffer | Buffer | Blob) => {
  let result: (MWBSchedule | WSchedule)[] = [];

  const isMWB = isMWBPub(filename);
  const isW = isWPub(filename);

  const jwpubContents = await extractZipFiles(input);

  let filesCount = Object.keys(jwpubContents.files).length;

  if (filesCount !== 2) {
    throw new Error(
      `The file you provided is not a valid ${
        isMWB ? 'Meeting Workbook' : 'Watchtower Study'
      } JWPUB file. Please make sure that the file is correct.`
    );
  }

  const jwpubYear = getPubYear(filename);
  const jwpubLang = getPubLanguage(filename);

  const htmlDocs = await getHTMLDocs(jwpubContents, isMWB, isW);

  if (isMWB) {
    result = await parseMWB({ htmlDocs: htmlDocs as HTMLElement[], year: jwpubYear, lang: jwpubLang });
  }

  if (isW) {
    const WDocs = htmlDocs as WPubContents;

    result = await parseWJwpub({ htmlItem: WDocs.toc, htmlDocs: WDocs.articles, lang: jwpubLang });
  }

  return result;
};
