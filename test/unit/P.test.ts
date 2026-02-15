import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'P';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Jak „ścigać się z końmi” (10 min)', CODE);

      expect(result.fulltitle).toBe('1. Jak „ścigać się z końmi”');
      expect(result.type).toBe('Jak „ścigać się z końmi”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Podtrzymywanie zainteresowania (4 min) OD DOMU DO DOMU. Domownik ma dzieci (lmd lekcja 3, punkt 3).',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Podtrzymywanie zainteresowania');
      expect(result.type).toBe('Podtrzymywanie zainteresowania');
      expect(result.src).toBe('OD DOMU DO DOMU. Domownik ma dzieci (lmd lekcja 3, punkt 3).');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5-11 stycznia', 2026, '2026/01/05'],
      ['2-8 lutego', 2026, '2026/02/02'],
      ['2-8 marca', 2026, '2026/03/02'],
      ['6-12 kwietnia', 2026, '2026/04/06'],
      ['4-10 maja', 2026, '2026/05/04'],
      ['1-7 czerwca', 2026, '2026/06/01'],
      ['6-12 lipca', 2026, '2026/07/06'],
      ['3-9 sierpnia', 2026, '2026/08/03'],
      ['7-13 września', 2026, '2026/09/07'],
      ['5-11 października', 2026, '2026/10/05'],
      ['2-8 listopada', 2026, '2026/11/02'],
      ['7-13 grudnia', 2026, '2026/12/07'],
    ])('parses standard date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 stycznia';
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
      ['5-11 stycznia 2026', '2026/01/05'],
      ['2-8 lutego 2026', '2026/02/02'],
      ['2-8 marca 2026', '2026/03/02'],
      ['6-12 kwietnia 2026', '2026/04/06'],
      ['4-10 maja 2026', '2026/05/04'],
      ['1-7 czerwca 2026', '2026/06/01'],
      ['6-12 lipca 2026', '2026/07/06'],
      ['3-9 sierpnia 2026', '2026/08/03'],
      ['7-13 września 2026', '2026/09/07'],
      ['5-11 października 2026', '2026/10/05'],
      ['2-8 listopada 2026', '2026/11/02'],
      ['7-13 grudnia 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months in same year
    it('parses day-month to day-month format', () => {
      const src = '29 czerwca do 5 lipca 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 stycznia 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '10-16 Foobar 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
