import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'X';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. „Mit Pferden um die Wette rennen“ (10 Min.)', CODE);

      expect(result.fulltitle).toBe('1. „Mit Pferden um die Wette rennen“');
      expect(result.type).toBe('„Mit Pferden um die Wette rennen“');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Interesse fördern (4 Min.) VON HAUS ZU HAUS. Dein Gesprächspartner hat Kinder. (lmd Lektion 3 Punkt 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Interesse fördern');
      expect(result.type).toBe('Interesse fördern');
      expect(result.src).toBe('VON HAUS ZU HAUS. Dein Gesprächspartner hat Kinder. (lmd Lektion 3 Punkt 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5.-11. Januar', 2026, '2026/01/05'],
      ['2.-8. Februar', 2026, '2026/02/02'],
      ['2.-8. März', 2026, '2026/03/02'],
      ['6.-12. April', 2026, '2026/04/06'],
      ['4.-10. Mai', 2026, '2026/05/04'],
      ['1.-7. Juni', 2026, '2026/06/01'],
      ['6.-12. Juli', 2026, '2026/07/06'],
      ['3.-9. August', 2026, '2026/08/03'],
      ['7.-13. September', 2026, '2026/09/07'],
      ['5.-11. Oktober', 2026, '2026/10/05'],
      ['2.-8. November', 2026, '2026/11/02'],
      ['7.-13. Dezember', 2026, '2026/12/07'],
    ])('parses range format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5. Januar';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5.-11. Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5.-11. Januar 2026', '2026/01/05'],
      ['2.-8. Februar 2026', '2026/02/02'],
      ['2.-8. März 2026', '2026/03/02'],
      ['6.-12. April 2026', '2026/04/06'],
      ['4.-10. Mai 2026', '2026/05/04'],
      ['1.-7. Juni 2026', '2026/06/01'],
      ['6.-12. Juli 2026', '2026/07/06'],
      ['3.-9. August 2026', '2026/08/03'],
      ['7.-13. September 2026', '2026/09/07'],
      ['5.-11. Oktober 2026', '2026/10/05'],
      ['2.-8. November 2026', '2026/11/02'],
      ['7.-13. Dezember 2026', '2026/12/07'],
    ])('parses range format > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months
    it('parses day-month to day-month format', () => {
      const src = '29. Juni-5. Juli 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5. Januar 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5.-11. Foobar 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
