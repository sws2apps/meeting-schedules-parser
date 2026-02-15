import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'Z';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Hur kan vi ”springa i kapp med hästar”? (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. Hur kan vi ”springa i kapp med hästar”?');
      expect(result.type).toBe('Hur kan vi ”springa i kapp med hästar”?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Följ upp intresset (4 min.) DÖRR TILL DÖRR. Personen du träffar är förälder. (lmd lektion 3, punkt 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Följ upp intresset');
      expect(result.type).toBe('Följ upp intresset');
      expect(result.src).toBe('DÖRR TILL DÖRR. Personen du träffar är förälder. (lmd lektion 3, punkt 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 januari', 2026, '2026/01/05'],
      ['2-8 februari', 2026, '2026/02/02'],
      ['2-8 mars', 2026, '2026/03/02'],
      ['6-12 april', 2026, '2026/04/06'],
      ['4-10 maj', 2026, '2026/05/04'],
      ['1-7 juni', 2026, '2026/06/01'],
      ['6-12 juli', 2026, '2026/07/06'],
      ['3-9 augusti', 2026, '2026/08/03'],
      ['7-13 september', 2026, '2026/09/07'],
      ['5-11 oktober', 2026, '2026/10/05'],
      ['2-8 november', 2026, '2026/11/02'],
      ['7-13 december', 2026, '2026/12/07'],
    ])('parses range format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 januari';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 januari 2026', '2026/01/05'],
      ['2-8 februari 2026', '2026/02/02'],
      ['2-8 mars 2026', '2026/03/02'],
      ['6-12 april 2026', '2026/04/06'],
      ['4-10 maj 2026', '2026/05/04'],
      ['1-7 juni 2026', '2026/06/01'],
      ['6-12 juli 2026', '2026/07/06'],
      ['3-9 augusti 2026', '2026/08/03'],
      ['7-13 september 2026', '2026/09/07'],
      ['5-11 oktober 2026', '2026/10/05'],
      ['2-8 november 2026', '2026/11/02'],
      ['7-13 december 2026', '2026/12/07'],
    ])('parses range format > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months
    it('parses day-month to day-month format', () => {
      const src = '29 juni-5 juli 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 januari 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 Foobar 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
