import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'TH';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Eaha te tauturu ia oe ia faaruru i te mau fifi? (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. Eaha te tauturu ia oe ia faaruru i te mau fifi?');
      expect(result.type).toBe('Eaha te tauturu ia oe ia faaruru i te mau fifi?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. A hoˈi e farerei (4 min.) I TERA E TERA FARE. E parau mai te fatu fare e tamarii ta ˈna. (lmd haapiiraa 3 numera 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. A hoˈi e farerei');
      expect(result.type).toBe('A hoˈi e farerei');
      expect(result.src).toBe(
        'I TERA E TERA FARE. E parau mai te fatu fare e tamarii ta ˈna. (lmd haapiiraa 3 numera 3)',
      );
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 no Tenuare', 2026, '2026/01/05'],
      ['2-8 no Fepuare', 2026, '2026/02/02'],
      ['2-8 no Mati', 2026, '2026/03/02'],
      ['6-12 no Eperera', 2026, '2026/04/06'],
      ['4-10 no Me', 2026, '2026/05/04'],
      ['1-7 no Tiunu', 2026, '2026/06/01'],
      ['6-12 no Tiurai', 2026, '2026/07/06'],
      ['3-9 no Atete', 2026, '2026/08/03'],
      ['7-13 no Tetepa', 2026, '2026/09/07'],
      ['5-11 no Atopa', 2026, '2026/10/05'],
      ['2-8 no Novema', 2026, '2026/11/02'],
      ['7-13 no Titema', 2026, '2026/12/07'],
    ])('parses range format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 no Tenuare';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 no Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 no Tenuare 2026', '2026/01/05'],
      ['2-8 no Fepuare 2026', '2026/02/02'],
      ['2-8 no Mati 2026', '2026/03/02'],
      ['6-12 no Eperera 2026', '2026/04/06'],
      ['4-10 no Me 2026', '2026/05/04'],
      ['1-7 no Tiunu 2026', '2026/06/01'],
      ['6-12 no Tiurai 2026', '2026/07/06'],
      ['3-9 no Atete 2026', '2026/08/03'],
      ['7-13 no Tetepa 2026', '2026/09/07'],
      ['5-11 no Atopa 2026', '2026/10/05'],
      ['2-8 no Novema 2026', '2026/11/02'],
      ['7-13 no Titema 2026', '2026/12/07'],
    ])('parses range format > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months
    it('parses day-month to day-month format', () => {
      const src = '29 no Tiunu-5 no Tiurai 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 no Tenuare 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 no Foobar 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
