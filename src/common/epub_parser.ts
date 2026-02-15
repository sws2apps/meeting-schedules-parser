import JSZip from 'jszip';
import { HTMLElement } from 'node-html-parser';

import { HTMLParse, getHTMLString, isValidHTML, isValidMWBSchedule, isValidWSchedule } from './html_validation.js';
import { MWBSchedule, WSchedule } from '../types/index.js';
import { getWStudyArticles, parseMWB, parseWSchedule } from './html_utils.js';
import { getPubLanguage, getPubYear, isMWBPub, isWPub } from './file_validation.js';
import { extractZipFiles } from './jszip_lib.js';

const getHTMLDocs = async (zip: JSZip, isMWB: boolean, isW: boolean) => {
  const files = [];

  for (let [filename] of Object.entries(zip.files)) {
    const isValidFile = isValidHTML(filename);

    if (isValidFile) {
      const content = await getHTMLString(zip, filename);
      const htmlDoc = HTMLParse(content);

      const isValidSchedule = isMWB ? isValidMWBSchedule(htmlDoc) : isW ? isValidWSchedule(htmlDoc) : false;

      if (isValidSchedule) {
        files.push(htmlDoc);
      }
    }
  }

  return files;
};

const getHTMLWTArticleDoc = async (zip: JSZip, articleFilename: string): Promise<HTMLElement> => {
  let article: HTMLElement;

  for (let [filename] of Object.entries(zip.files)) {
    const shortName = meeting_schedules_parser.path.basename(filename);
    if (shortName === articleFilename) {
      const content = await getHTMLString(zip, filename);
      const htmlDoc = HTMLParse(content);

      article = htmlDoc;
      break;
    }
  }

  return article!;
};

const parseWEpub = async ({
  htmlItem,
  epubLang,
  epubYear,
  epubIssueMonth,
  epubContents,
}: {
  htmlItem: HTMLElement;
  epubLang: string;
  epubYear: number;
  epubIssueMonth: number;
  epubContents: JSZip;
}) => {
  const weeksData = [];

  const studyArticles = getWStudyArticles(htmlItem);

  for (const [_, studyArticle] of studyArticles.entries()) {
    const articleLink = studyArticle.nextElementSibling!.querySelector('a')!.getAttribute('href') as string;
    const content = await getHTMLWTArticleDoc(epubContents, articleLink);

    const weekItem = parseWSchedule(studyArticle, content, epubLang, epubYear, epubIssueMonth);
    weeksData.push(weekItem);
  }

  return weeksData;
};

export const parseEPUB = async (filename: string, input: string | ArrayBuffer | Buffer | Blob) => {
  let result: (MWBSchedule | WSchedule)[] = [];

  const isMWB = isMWBPub(filename);
  const isW = isWPub(filename);

  const epubContents = await extractZipFiles(input);

  const htmlDocs = await getHTMLDocs(epubContents, isMWB, isW);

  if (htmlDocs.length === 0) {
    throw new Error(
      `The file you provided is not a valid ${
        isMWB ? 'Meeting Workbook' : 'Watchtower Study'
      } EPUB file. Please make sure that the file is correct.`
    );
  }

  if (isW && htmlDocs.length > 1) {
    throw new Error(
      `The file you provided is not a valid Watchtower Study EPUB file. Please make sure that the file is correct.`
    );
  }

  const epubYear = getPubYear(filename);
  const epubLang = getPubLanguage(filename);
  const epubIssueMonth = +filename.split('_')[2].substring(4, 6);

  if (isMWB) {
    result = await parseMWB({ htmlDocs, year: epubYear, lang: epubLang });
  }

  if (isW) {
    result = await parseWEpub({
      htmlItem: htmlDocs[0],
      epubLang,
      epubYear,
      epubIssueMonth,
      epubContents,
    });
  }

  return result;
};
