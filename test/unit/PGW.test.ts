import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'PGW';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. How to “Run With Horse Them” (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. How to “Run With Horse Them”');
      expect(result.type).toBe('How to “Run With Horse Them”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. When You De Check the Person Again (4 min.) HOUSE TO HOUSE. The householder na mama or papa. (lmd lesson 3 point 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. When You De Check the Person Again');
      expect(result.type).toBe('When You De Check the Person Again');
      expect(result.src).toBe('HOUSE TO HOUSE. The householder na mama or papa. (lmd lesson 3 point 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: month + day
    it.each([
      ['January 5', 2026, '2026/01/05'],
      ['February 2', 2026, '2026/02/02'],
      ['March 2', 2026, '2026/03/02'],
      ['April 6', 2026, '2026/04/06'],
      ['May 4', 2026, '2026/05/04'],
      ['June 1', 2026, '2026/06/01'],
      ['July 6', 2026, '2026/07/06'],
      ['August 3', 2026, '2026/08/03'],
      ['September 7', 2026, '2026/09/07'],
      ['October 5', 2026, '2026/10/05'],
      ['November 2', 2026, '2026/11/02'],
      ['December 7', 2026, '2026/12/07'],
    ])('parses month-day format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = 'Foobar 5';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: month day–day, year
    it.each([
      ['January 5-11, 2026', '2026/01/05'],
      ['February 2-8, 2026', '2026/02/02'],
      ['March 2-8, 2026', '2026/03/02'],
      ['April 6-12, 2026', '2026/04/06'],
      ['May 4-10, 2026', '2026/05/04'],
      ['June 1-7, 2026', '2026/06/01'],
      ['July 6-12, 2026', '2026/07/06'],
      ['August 3-9, 2026', '2026/08/03'],
      ['September 7-13, 2026', '2026/09/07'],
      ['October 5-11, 2026', '2026/10/05'],
      ['November 2-8, 2026', '2026/11/02'],
      ['December 7-13, 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: month day–month day, year
    it('parses month-day to month-day format', () => {
      const src = 'June 29–July 5, 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: month day, year
    it('parses single day format', () => {
      const src = 'January 5, 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = 'Foobar 10-16, 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
