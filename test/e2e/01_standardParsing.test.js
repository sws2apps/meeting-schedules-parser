import fs from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadPub } from '../../dist/node/index.js';

const list = JSON.parse(await fs.readFile(new URL('./standardParsing/list.json', import.meta.url)));
const JW_CDN = 'https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?';

async function fetchData(language, issue, pub) {
  const url = JW_CDN + new URLSearchParams({ langwritten: language, pub, output: 'json', issue });
  const res = await fetch(url);
  if (res.status !== 200) throw new Error(`Failed to fetch ${url}`);

  const result = await res.json();
  const fileUrl = result.files[language].JWPUB[0].file.url;
  const filename = path.basename(fileUrl);
  const data = await loadPub({ url: fileUrl });

  const jsonPath = `./test/e2e/fixtures/${filename.replace('.jwpub', '.json')}`;
  const fixture = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

  return { data, fixture };
}

describe('Standard Parsing', () => {
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
