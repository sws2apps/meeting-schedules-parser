import fs from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadPub } from '../../dist/node/index.js';

const list = JSON.parse(await fs.readFile(new URL('./enhancedParsing/list.json', import.meta.url)));
const JW_CDN = 'https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?';

async function fetchIssueData(issue) {
  const file = issue.JWPUB?.[0] ?? issue.EPUB?.[0];
  if (!file) return [];
  return loadPub({ url: file.file.url });
}

async function fetchData(language, issue, pub) {
  const url = JW_CDN + new URLSearchParams({ langwritten: language, pub, output: 'json', issue });
  const res = await fetch(url);
  if (res.status !== 200) throw new Error(`Failed to fetch ${url}`);

  const result = await res.json();
  const { EPUB, JWPUB } = result.files[language];
  const issueFetch = { issueDate: issue, currentYear: issue.substring(0, 4), language, EPUB, JWPUB };

  const data = await fetchIssueData(issueFetch);

  let fixturePath;
  if (JWPUB) {
    const filename = path.basename(JWPUB[0].file.url).replace('.jwpub', '.json');
    fixturePath = `./test/e2e/fixtures/${filename}`;
  } else if (EPUB) {
    const filename = path.basename(EPUB[0].file.url).replace('.epub', '.json');
    fixturePath = `./test/e2e/fixtures/${filename}`;
  } else {
    fixturePath = `./test/e2e/fixtures/${pub}_${language}_${issue}.json`;
  }

  const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
  return { data, fixture };
}

describe('Enhanced Parsing', () => {
  it.each(list)('parses MWB for %s', async ({ language, issue }) => {
    const { data, fixture } = await fetchData(language, issue, 'mwb');
    expect(data).toHaveLength(fixture.length);
    fixture.forEach((week, i) => {
      expect(data[i]).toMatchObject(week);
    });
  });

  it.each(list)('parses Watchtower for %s', async ({ language, issue }) => {
    const { data, fixture } = await fetchData(language, issue, 'w');
    expect(data).toHaveLength(fixture.length);
    fixture.forEach((week, i) => {
      expect(data[i]).toMatchObject(week);
    });
  });
});
