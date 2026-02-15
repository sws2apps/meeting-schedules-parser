import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'SW';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Jinsi ya “Kushindana Mbio na Farasi” (Dak. 10)', CODE);

      expect(result.fulltitle).toBe('1. Jinsi ya “Kushindana Mbio na Farasi”');
      expect(result.type).toBe('Jinsi ya “Kushindana Mbio na Farasi”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Kufuatia Upendezi (Dak. 4) NYUMBA KWA NYUMBA. Mwenye nyumba ni mzazi. (lmd somo la 3 jambo kuu la 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Kufuatia Upendezi');
      expect(result.type).toBe('Kufuatia Upendezi');
      expect(result.src).toBe('NYUMBA KWA NYUMBA. Mwenye nyumba ni mzazi. (lmd somo la 3 jambo kuu la 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: month + day
    it.each([
      ['Januari 5', 2026, '2026/01/05'],
      ['Februari 2', 2026, '2026/02/02'],
      ['Machi 2', 2026, '2026/03/02'],
      ['Aprili 6', 2026, '2026/04/06'],
      ['Mei 4', 2026, '2026/05/04'],
      ['Juni 1', 2026, '2026/06/01'],
      ['Julai 6', 2026, '2026/07/06'],
      ['Agosti 3', 2026, '2026/08/03'],
      ['Septemba 7', 2026, '2026/09/07'],
      ['Oktoba 5', 2026, '2026/10/05'],
      ['Novemba 2', 2026, '2026/11/02'],
      ['Desemba 7', 2026, '2026/12/07'],
    ])('parses month-day format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = 'Foobar 5';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: month day–day, year
    it.each([
      ['Januari 5-11, 2026', '2026/01/05'],
      ['Februari 2-8, 2026', '2026/02/02'],
      ['Machi 2-8, 2026', '2026/03/02'],
      ['Aprili 6-12, 2026', '2026/04/06'],
      ['Mei 4-10, 2026', '2026/05/04'],
      ['Juni 1-7, 2026', '2026/06/01'],
      ['Julai 6-12, 2026', '2026/07/06'],
      ['Agosti 3-9, 2026', '2026/08/03'],
      ['Septemba 7-13, 2026', '2026/09/07'],
      ['Oktoba 5-11, 2026', '2026/10/05'],
      ['Novemba 2-8, 2026', '2026/11/02'],
      ['Desemba 7-13, 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: month day–month day, year
    it('parses month-day to month-day format', () => {
      const src = 'Juni 29–Julai 5, 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: month day, year
    it('parses single day format', () => {
      const src = 'Januari 5, 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = 'Foobar 5-11, 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
