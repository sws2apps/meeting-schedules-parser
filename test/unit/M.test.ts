import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'M';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Cum „să te iei la întrecere cu caii” (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. Cum „să te iei la întrecere cu caii”');
      expect(result.type).toBe('Cum „să te iei la întrecere cu caii”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Fă vizite ulterioare (4 min.) DIN CASĂ ÎN CASĂ. Locatarul este părinte. (lmd lecția 3, punctul 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Fă vizite ulterioare');
      expect(result.type).toBe('Fă vizite ulterioare');
      expect(result.src).toBe('DIN CASĂ ÎN CASĂ. Locatarul este părinte. (lmd lecția 3, punctul 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5-11 Ianuarie', 2026, '2026/01/05'],
      ['2-8 Februarie', 2026, '2026/02/02'],
      ['2-8 Martie', 2026, '2026/03/02'],
      ['6-12 Aprilie', 2026, '2026/04/06'],
      ['4-10 Mai', 2026, '2026/05/04'],
      ['1-7 Iunie', 2026, '2026/06/01'],
      ['6-12 Iulie', 2026, '2026/07/06'],
      ['3-9 August', 2026, '2026/08/03'],
      ['7-13 Septembrie', 2026, '2026/09/07'],
      ['5-11 Octombrie', 2026, '2026/10/05'],
      ['2-8 Noiembrie', 2026, '2026/11/02'],
      ['7-13 Decembrie', 2026, '2026/12/07'],
    ])('parses standard date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 Ianuarie';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '5-11 Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5-11 Ianuarie 2026', '2026/01/05'],
      ['2-8 Februarie 2026', '2026/02/02'],
      ['2-8 Martie 2026', '2026/03/02'],
      ['6-12 Aprilie 2026', '2026/04/06'],
      ['4-10 Mai 2026', '2026/05/04'],
      ['1-7 Iunie 2026', '2026/06/01'],
      ['6-12 Iulie 2026', '2026/07/06'],
      ['3-9 August 2026', '2026/08/03'],
      ['7-13 Septembrie 2026', '2026/09/07'],
      ['5-11 Octombrie 2026', '2026/10/05'],
      ['2-8 Noiembrie 2026', '2026/11/02'],
      ['7-13 Decembrie 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months in same year
    it('parses day-month to day-month format', () => {
      const src = '29 Iunie–5 Iulie 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 Ianuarie 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '10-16 Foobar 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
