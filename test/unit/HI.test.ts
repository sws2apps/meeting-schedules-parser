import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'HI';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. ‘घोड़ों के साथ दौड़’ कैसे लगाएँ? (10 मि.)', CODE);

      expect(result.fulltitle).toBe('1. ‘घोड़ों के साथ दौड़’ कैसे लगाएँ?');
      expect(result.type).toBe('‘घोड़ों के साथ दौड़’ कैसे लगाएँ?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. वापसी भेंट करना (4 मि.) घर-घर का प्रचार। घर-मालिक एक माँ या पिता है। (प्यार पाठ 3 मुद्दा 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. वापसी भेंट करना');
      expect(result.type).toBe('वापसी भेंट करना');
      expect(result.src).toBe('घर-घर का प्रचार। घर-मालिक एक माँ या पिता है। (प्यार पाठ 3 मुद्दा 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 जनवरी', 2026, '2026/01/05'],
      ['2-8 फरवरी', 2026, '2026/02/02'],
      ['2-8 मार्च', 2026, '2026/03/02'],
      ['6-12 अप्रैल', 2026, '2026/04/06'],
      ['4-10 मई', 2026, '2026/05/04'],
      ['1-7 जून', 2026, '2026/06/01'],
      ['6-12 जुलाई', 2026, '2026/07/06'],
      ['3-9 अगस्त', 2026, '2026/08/03'],
      ['7-13 सितंबर', 2026, '2026/09/07'],
      ['5-11 अक्टूबर', 2026, '2026/10/05'],
      ['2-8 नवंबर', 2026, '2026/11/02'],
      ['7-13 दिसंबर', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([['29 जून', 2026, '2026/06/29']])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '5 जवरी';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5-11 जनवरी, 2026', '2026/01/05'],
      ['2-8 फरवरी, 2026', '2026/02/02'],
      ['2-8 मार्च, 2026', '2026/03/02'],
      ['6-12 अप्रैल, 2026', '2026/04/06'],
      ['4-10 मई, 2026', '2026/05/04'],
      ['1-7 जून, 2026', '2026/06/01'],
      ['6-12 जुलाई, 2026', '2026/07/06'],
      ['3-9 अगस्त, 2026', '2026/08/03'],
      ['7-13 सितंबर, 2026', '2026/09/07'],
      ['5-11 अक्टूबर, 2026', '2026/10/05'],
      ['2-8 नवंबर, 2026', '2026/11/02'],
      ['7-13 दिसंबर, 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([['29 जून, 2026', '2026/06/29']])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '7-13 दिबर, 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
