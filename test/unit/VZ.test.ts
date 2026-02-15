import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'VZ';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Hahavita ‘Hifania amy Sôvaly’ va Iha? (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. Hahavita ‘Hifania amy Sôvaly’ va Iha?');
      expect(result.type).toBe('Hahavita ‘Hifania amy Sôvaly’ va Iha?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Manaova Fimpolia Mitsidiky (4 min.) SANTRANO. Manan’anaky tompon-trano iny. (lmd fianara 3, hevitsy 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Manaova Fimpolia Mitsidiky');
      expect(result.type).toBe('Manaova Fimpolia Mitsidiky');
      expect(result.src).toBe('SANTRANO. Manan’anaky tompon-trano iny. (lmd fianara 3, hevitsy 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 Zanviè', 2026, '2026/01/05'],
      ['2-8 Fevriè', 2026, '2026/02/02'],
      ['2-8 Marsa', 2026, '2026/03/02'],
      ['6-12 Avrily', 2026, '2026/04/06'],
      ['4-10 Mey', 2026, '2026/05/04'],
      ['1-7 Ziein', 2026, '2026/06/01'],
      ['6-12 Ziè', 2026, '2026/07/06'],
      ['3-9 Oòh', 2026, '2026/08/03'],
      ['7-13 Septambra', 2026, '2026/09/07'],
      ['5-11 Oktobra', 2026, '2026/10/05'],
      ['2-8 Novambra', 2026, '2026/11/02'],
      ['7-13 Desambra', 2026, '2026/12/07'],
    ])('parses range format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 Zanviè';
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
      ['5-11 Zanviè 2026', '2026/01/05'],
      ['2-8 Fevriè 2026', '2026/02/02'],
      ['2-8 Marsa 2026', '2026/03/02'],
      ['6-12 Avrily 2026', '2026/04/06'],
      ['4-10 Mey 2026', '2026/05/04'],
      ['1-7 Ziein 2026', '2026/06/01'],
      ['6-12 Ziè 2026', '2026/07/06'],
      ['3-9 Oòh 2026', '2026/08/03'],
      ['7-13 Septambra 2026', '2026/09/07'],
      ['5-11 Oktobra 2026', '2026/10/05'],
      ['2-8 Novambra 2026', '2026/11/02'],
      ['7-13 Desambra 2026', '2026/12/07'],
    ])('parses range format > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months
    it('parses day-month to day-month format', () => {
      const src = '29 Ziein-5 Ziè 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 Zanviè 2026';
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
