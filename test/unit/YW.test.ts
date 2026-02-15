import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'YW';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Uko ‘twasiganwa n’amafarashi’ (Imin. 10)', CODE);

      expect(result.fulltitle).toBe('1. Uko ‘twasiganwa n’amafarashi’');
      expect(result.type).toBe('Uko ‘twasiganwa n’amafarashi’');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Kongera kuganira n’umuntu (Imin. 4) KUBWIRIZA KU NZU N’INZU. Nyiri inzu ni umubyeyi. (lmd isomo rya 3 ingingo ya 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Kongera kuganira n’umuntu');
      expect(result.type).toBe('Kongera kuganira n’umuntu');
      expect(result.src).toBe('KUBWIRIZA KU NZU N’INZU. Nyiri inzu ni umubyeyi. (lmd isomo rya 3 ingingo ya 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 Mutarama', 2026, '2026/01/05'],
      ['2-8 Gashyantare', 2026, '2026/02/02'],
      ['2-8 Werurwe', 2026, '2026/03/02'],
      ['6-12 Mata', 2026, '2026/04/06'],
      ['4-10 Gicurasi', 2026, '2026/05/04'],
      ['1-7 Kamena', 2026, '2026/06/01'],
      ['6-12 Nyakanga', 2026, '2026/07/06'],
      ['3-9 Kanama', 2026, '2026/08/03'],
      ['7-13 Nzeri', 2026, '2026/09/07'],
      ['5-11 Ukwakira', 2026, '2026/10/05'],
      ['2-8 Ugushyingo', 2026, '2026/11/02'],
      ['7-13 Ukuboza', 2026, '2026/12/07'],
    ])('parses range format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 Mutarama';
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
      ['5-11 Mutarama 2026', '2026/01/05'],
      ['2-8 Gashyantare 2026', '2026/02/02'],
      ['2-8 Werurwe 2026', '2026/03/02'],
      ['6-12 Mata 2026', '2026/04/06'],
      ['4-10 Gicurasi 2026', '2026/05/04'],
      ['1-7 Kamena 2026', '2026/06/01'],
      ['6-12 Nyakanga 2026', '2026/07/06'],
      ['3-9 Kanama 2026', '2026/08/03'],
      ['7-13 Nzeri 2026', '2026/09/07'],
      ['5-11 Ukwakira 2026', '2026/10/05'],
      ['2-8 Ugushyingo 2026', '2026/11/02'],
      ['7-13 Ukuboza 2026', '2026/12/07'],
    ])('parses range format > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months
    it('parses day-month to day-month format', () => {
      const src = '29 Kamena-5 Nyakanga 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 Mutarama 2026';
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
