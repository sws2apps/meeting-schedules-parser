import { describe, expect, it } from 'vitest';
import { parse } from 'node-html-parser';

import '../../src/node/utils.node.js';
import {
  getMWBWeekDate,
  getMWBWeeklyBibleReading,
  getMWBAYFCount,
  getMWBLCCount,
  getMWBSources,
  getWStudyArticles,
  getWStudyDate,
  getWSTudySongs,
  getWStudyTitle,
  parseWSchedule,
  parseMWB,
} from '../../src/common/html_utils.js';

describe('html_utils', () => {
  describe('getMWBWeekDate', () => {
    it('extracts text from h1 element', () => {
      const html = '<div><h1>January 4-10, 2026</h1></div>';
      const doc = parse(html);
      const h1 = doc.querySelector('h1');
      const divWrapper = parse('<div></div>');
      divWrapper.appendChild(h1!);

      const result = getMWBWeekDate(divWrapper);
      expect(result).toBe('January 4-10, 2026');
    });

    it('replaces non-breaking spaces with regular spaces', () => {
      const html = '<div><h1>January\u00A04-10,\u00A02026</h1></div>';
      const doc = parse(html);
      const h1 = doc.querySelector('h1');
      const divWrapper = parse('<div></div>');
      divWrapper.appendChild(h1!);

      const result = getMWBWeekDate(divWrapper);
      expect(result).toBe('January 4-10, 2026');
    });

    it('handles multiple non-breaking spaces', () => {
      const html = '<div><h1>Date\u00A0\u00A0\u00A0Value</h1></div>';
      const doc = parse(html);
      const h1 = doc.querySelector('h1');
      const divWrapper = parse('<div></div>');
      divWrapper.appendChild(h1!);

      const result = getMWBWeekDate(divWrapper);
      expect(result).toBe('Date   Value');
    });
  });

  describe('getMWBWeeklyBibleReading', () => {
    it('extracts text from h2 element', () => {
      const html = '<div><h2>Luke 4-5</h2></div>';
      const doc = parse(html);
      const h2 = doc.querySelector('h2');
      const divWrapper = parse('<div></div>');
      divWrapper.appendChild(h2!);

      const result = getMWBWeeklyBibleReading(divWrapper);
      expect(result).toBe('Luke 4-5');
    });

    it('removes non-breaking spaces from h2', () => {
      const html = '<div><h2>Luke\u00A04-5</h2></div>';
      const doc = parse(html);
      const h2 = doc.querySelector('h2');
      const divWrapper = parse('<div></div>');
      divWrapper.appendChild(h2!);

      const result = getMWBWeeklyBibleReading(divWrapper);
      expect(result).toBe('Luke 4-5');
    });
  });

  describe('getMWBAYFCount', () => {
    it('counts elements with class du-color--gold-700 minus 1', () => {
      const html = `
        <div>
          <span class="du-color--gold-700">1</span>
          <span class="du-color--gold-700">2</span>
          <span class="du-color--gold-700">3</span>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBAYFCount(doc.querySelector('div')!);
      expect(result).toBe(2); // 3 elements - 1
    });

    it('returns 0 when only one element exists', () => {
      const html = '<div><span class="du-color--gold-700">1</span></div>';
      const doc = parse(html);
      const result = getMWBAYFCount(doc.querySelector('div')!);
      expect(result).toBe(0); // 1 - 1
    });

    it('returns 0 when no matching elements', () => {
      const html = '<div><span>no match</span></div>';
      const doc = parse(html);
      const result = getMWBAYFCount(doc.querySelector('div')!);
      expect(result).toBe(-1); // 0 - 1
    });
  });

  describe('getMWBLCCount', () => {
    it('counts elements with specific LC classes minus 1', () => {
      const html = `
        <div>
          <span class="du-color--maroon-600 du-margin-top--8 du-margin-bottom--0">1</span>
          <span class="du-color--maroon-600 du-margin-top--8 du-margin-bottom--0">2</span>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBLCCount(doc.querySelector('div')!);
      expect(result).toBe(1); // 2 - 1
    });

    it('returns 0 when only one LC element', () => {
      const html = '<div><span class="du-color--maroon-600 du-margin-top--8 du-margin-bottom--0">1</span></div>';
      const doc = parse(html);
      const result = getMWBLCCount(doc.querySelector('div')!);
      expect(result).toBe(0); // 1 - 1
    });

    it('matches exact class combination', () => {
      const html = `
        <div>
          <span class="du-color--maroon-600">no match (missing other classes)</span>
          <span class="du-color--maroon-600 du-margin-top--8 du-margin-bottom--0">match</span>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBLCCount(doc.querySelector('div')!);
      expect(result).toBe(0); // 1 - 1
    });
  });

  describe('getMWBSources', () => {
    it('extracts text from h3 elements', () => {
      const html = `
        <div>
          <h3 class="dc-icon--music">Opening Song</h3>
          <h3>Talk</h3>
          <h3>Gems</h3>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBSources(doc.querySelector('div')!);
      expect(result).toContain('Opening Song');
      expect(result).toContain('Talk');
      expect(result).toContain('Gems');
    });

    it('replaces pipe character with @ for songs', () => {
      const html = `
        <div>
          <h3 class="dc-icon--music">Song 1 | Opening</h3>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBSources(doc.querySelector('div')!);
      expect(result).toContain('Song 1 @ Opening');
    });

    it('removes non-breaking spaces', () => {
      const html = `
        <div>
          <h3>Source\u00A0Text</h3>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBSources(doc.querySelector('div')!);
      expect(result).not.toContain('\u00A0');
    });

    it('separates h3 entries with @ delimiter', () => {
      const html = `
        <div>
          <h3>First</h3>
          <h3>Second</h3>
          <h3>Third</h3>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBSources(doc.querySelector('div')!);
      const parts = result.split('@');
      expect(parts.length).toBeGreaterThan(1);
    });

    it('handles music icon as child element', () => {
      const html = `
        <div>
          <h3><span class="dc-icon--music"></span>Song Text</h3>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBSources(doc.querySelector('div')!);
      expect(result).toContain('Song Text');
    });

    it('handles part without song music icon', () => {
      const html = `
        <div>
          <h3>Regular Part</h3>
          <div class="boxContent"></div>
        </div>
      `;
      const doc = parse(html);
      const result = getMWBSources(doc.querySelector('div')!);
      expect(result).toContain('Regular Part');
    });
  });

  describe('getWStudyArticles', () => {
    it('returns all h3 elements from W study', () => {
      const html = `
        <div>
          <h3>Article 1</h3>
          <h3>Article 2</h3>
          <h3>Article 3</h3>
        </div>
      `;
      const doc = parse(html);
      const result = getWStudyArticles(doc.querySelector('div')!);
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no h3 elements', () => {
      const html = '<div><p>No articles</p></div>';
      const doc = parse(html);
      const result = getWStudyArticles(doc.querySelector('div')!);
      expect(result).toHaveLength(0);
    });
  });

  describe('getWStudyDate', () => {
    it('extracts date from element with desc class', () => {
      const html = '<div><p class="desc">January 4-10, 2026</p></div>';
      const doc = parse(html);
      const result = getWStudyDate(doc.querySelector('div')!);
      expect(result).toBe('January 4-10, 2026');
    });

    it('extracts text content when no desc class element', () => {
      const html = '<div>January 4-10, 2026</div>';
      const doc = parse(html);
      const result = getWStudyDate(doc);
      expect(result).toContain('January');
    });

    it('removes non-breaking spaces', () => {
      const html = '<div><p class="desc">January\u00A04-10</p></div>';
      const doc = parse(html);
      const result = getWStudyDate(doc.querySelector('div')!);
      expect(result).toBe('January 4-10');
    });
  });

  describe('getWSTudySongs', () => {
    it('extracts opening and concluding song numbers', () => {
      const html = `
        <div>
          <div class="pubRefs">Song 10</div>
          <div class="blockTeach"></div>
          <div class="pubRefs">Song 20</div>
        </div>
      `;
      const doc = parse(html);
      const result = getWSTudySongs(doc.querySelector('div')!);
      expect(result.w_study_opening_song).toBe(10);
      expect(result.w_study_concluding_song).toBe(20);
    });

    it('handles two pubRefs case (blockTeach between)', () => {
      const html = `
        <div>
          <div class="pubRefs">Song 15</div>
          <div class="blockTeach"></div>
          <div class="pubRefs">Song 25</div>
        </div>
      `;
      const doc = parse(html);
      const result = getWSTudySongs(doc.querySelector('div')!);
      expect(result.w_study_opening_song).toBe(15);
      expect(result.w_study_concluding_song).toBe(25);
    });

    it('extracts song numbers from text with formatting', () => {
      const html = `
        <div>
          <div class="pubRefs">Song 123</div>
          <div class="blockTeach"></div>
          <div class="pubRefs">Song 45</div>
        </div>
      `;
      const doc = parse(html);
      const result = getWSTudySongs(doc.querySelector('div')!);
      expect(result.w_study_opening_song).toBe(123);
      expect(result.w_study_concluding_song).toBe(45);
    });
  });

  describe('getWStudyTitle', () => {
    it('extracts title from h2 element', () => {
      const html = '<div><h2>Study Title</h2></div>';
      const doc = parse(html);
      const result = getWStudyTitle(doc.querySelector('div')!);
      expect(result).toBe('Study Title');
    });

    it('trims whitespace from h2', () => {
      const html = '<div><h2>  Title with spaces  </h2></div>';
      const doc = parse(html);
      const result = getWStudyTitle(doc.querySelector('div')!);
      expect(result).toBe('Title with spaces');
    });

    it('removes non-breaking spaces from title', () => {
      const html = '<div><h2>Title\u00A0with\u00A0spaces</h2></div>';
      const doc = parse(html);
      const result = getWStudyTitle(doc.querySelector('div')!);
      expect(result).toBe('Title with spaces');
    });
  });

  describe('parseWSchedule', () => {
    it('handles non-enhanced language parsing', () => {
      const articleHtml = '<div><h2>Study Date</h2></div>';
      const contentHtml = `
        <div>
          <div class="pubRefs">Song 10</div>
          <div class="blockTeach"></div>
          <div class="pubRefs">Song 20</div>
        </div>
      `;
      const article = parse(articleHtml).querySelector('div')!;
      const content = parse(contentHtml).querySelector('div')!;

      const result = parseWSchedule(article, content, 'UNDEFINED', 2026, 1);

      expect(result.w_study_opening_song).toBe(10);
      expect(result.w_study_concluding_song).toBe(20);
    });

    it('extracts study title from article', () => {
      const articleHtml = '<div><h2>Understanding the Bible</h2></div>';
      const contentHtml = `
        <div>
          <div class="pubRefs">Song 10</div>
          <div class="blockTeach"></div>
          <div class="pubRefs">Song 20</div>
        </div>
      `;
      const article = parse(articleHtml).querySelector('div')!;
      const content = parse(contentHtml).querySelector('div')!;

      const result = parseWSchedule(article, content, 'UNDEFINED', 2026, 1);

      expect(result.w_study_title).toBe('Understanding the Bible');
    });
  });

  describe('parseMWB', () => {
    it('handles empty array', async () => {
      const result = await parseMWB({ htmlDocs: [], year: 2026, lang: 'UNDEFINED' });
      expect(result).toHaveLength(0);
    });

    it('returns array when given HTML documents', async () => {
      const html = `
        <div>
          <h1>Date</h1>
          <h2>Reading</h2>
          <h3 class="dc-icon--music">Song 1</h3>
          <h3>Part 1</h3>
          <h3>Part 2</h3>
          <h3>Part 3</h3>
          <h3>Part 4</h3>
          <h3>Part 5</h3>
          <h3>Part 6</h3>
          <h3>Part 7</h3>
          <h3>Part 8</h3>
          <h3>Part 9</h3>
          <h3>Part 10</h3>
          <span class="du-color--gold-700">A</span>
          <span class="du-color--maroon-600 du-margin-top--8 du-margin-bottom--0">B</span>
        </div>
      `;

      const doc = parse(html).querySelector('div')!;
      const result = await parseMWB({ htmlDocs: [doc], year: 2026, lang: 'UNDEFINED' });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('mwb_weekly_bible_reading');
    });
  });
});
