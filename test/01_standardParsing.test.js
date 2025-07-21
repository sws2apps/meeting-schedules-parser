import fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { loadPub } from '../dist/node/index.js';

const list = JSON.parse(await fs.promises.readFile(new URL('./standardParsing/list.json', import.meta.url)));
const JW_CDN = 'https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?';

const fetchData = async (language, issue, pub) => {
  let data = [];
  let fixture = [];

  const url =
    JW_CDN +
    new URLSearchParams({
      langwritten: language,
      pub,
      output: 'json',
      issue,
    });

  const res = await fetch(url);

  if (res.status === 200) {
    const result = await res.json();
    const fileUrl = result.files[language].JWPUB[0].file.url;
    const filename = path.basename(fileUrl);
    data = await loadPub({ url: fileUrl });

    const jsonPath = `./test/fixtures/${filename.replace('.jwpub', '.json')}`;
    fixture = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  return { data, fixture };
};

describe('Testing Standard Parsing', () => {
  for (let i = 0; i < list.length; i++) {
    const { language, issue } = list[i];

    describe(`Test loadPub function for ${language} language`, async () => {
      it(`Parsing Meeting Workbook file`, async () => {
        const { data, fixture } = await fetchData(language, issue, 'mwb');

        for (let a = 0; a < fixture.length; a++) {
          const week = fixture[a];
          for (let [key, value] of Object.entries(week)) {
            expect(data[a]).to.have.property(key).equal(value);
          }
        }
      });

      it(`Parsing Watchtower Study file`, async () => {
        const { data, fixture } = await fetchData(language, issue, 'w');

        for (let a = 0; a < fixture.length; a++) {
          const week = fixture[a];
          for (let [key, value] of Object.entries(week)) {
            expect(data[a]).to.have.property(key).equal(value);
          }
        }
      });
    });
  }
});
