import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'E';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. How to “Run a Race Against Horses” (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. How to “Run a Race Against Horses”');
      expect(result.type).toBe('How to “Run a Race Against Horses”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. Talk (5 min.) lmd appendix A point 17—Theme: Jesus Was a Great Teacher Whose Advice Always Works. (th study 14)',
        CODE,
      );

      expect(result.fulltitle).toBe('6. Talk');
      expect(result.type).toBe('Talk');
      expect(result.src).toBe(
        'lmd appendix A point 17—Theme: Jesus Was a Great Teacher Whose Advice Always Works. (th study 14)',
      );
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['January 5-11', 2026, '2026/01/05'],
      ['February 2-8', 2026, '2026/02/02'],
      ['March 2-8', 2026, '2026/03/02'],
      ['April 6-12', 2026, '2026/04/06'],
      ['May 4-10', 2026, '2026/05/04'],
      ['June 1-7', 2026, '2026/06/01'],
      ['July 6-12', 2026, '2026/07/06'],
      ['August 3-9', 2026, '2026/08/03'],
      ['September 7-13', 2026, '2026/09/07'],
      ['October 5-11', 2026, '2026/10/05'],
      ['November 2-8', 2026, '2026/11/02'],
      ['December 7-13', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['June 29–July 5', 2026, '2026/06/29'],
      ['December 29, 2025–January 4, 2026', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = 'Foobar 5-11';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
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
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['June 29–July 5, 2026', '2026/06/29'],
      ['December 29, 2025–January 4, 2026', '2025/12/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = 'Foobar 10-16, 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
