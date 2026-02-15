import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'MG';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Hotahin’i Jehovah Isika (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. Hotahin’i Jehovah Isika');
      expect(result.type).toBe('Hotahin’i Jehovah Isika');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '4. Miresadresaha Aloha (3 min.) ISAN-TRANO. Mampiasà taratasy mivalona mba hanombohana resadresaka. (lmd lesona 1 hevitra 5)',
        CODE,
      );

      expect(result.fulltitle).toBe('4. Miresadresaha Aloha');
      expect(result.type).toBe('Miresadresaha Aloha');
      expect(result.src).toBe(
        'ISAN-TRANO. Mampiasà taratasy mivalona mba hanombohana resadresaka. (lmd lesona 1 hevitra 5)',
      );
      expect(result.time).toBe(3);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 Janoary', 2026, '2026/01/05'],
      ['2-8 Febroary', 2026, '2026/02/02'],
      ['2-8 Martsa', 2026, '2026/03/02'],
      ['6-12 Aprily', 2026, '2026/04/06'],
      ['4-10 Mey', 2026, '2026/05/04'],
      ['1-7 Jona', 2026, '2026/06/01'],
      ['6-12 Jolay', 2026, '2026/07/06'],
      ['3-9 Aogositra', 2026, '2026/08/03'],
      ['7-13 Septambra', 2026, '2026/09/07'],
      ['5-11 Oktobra', 2026, '2026/10/05'],
      ['2-8 Novambra', 2026, '2026/11/02'],
      ['7-13 Desambra', 2026, '2026/12/07'],
    ])('parses normal date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Jona–5 Jolay', 2026, '2026/06/29'],
      ['29 Desambra 2025–4 Janoary 2026', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4-10 Janary';
      expect(() => extractMWBDate(src, 2027, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5-11 Janoary 2026', '2026/01/05'],
      ['2-8 Febroary 2026', '2026/02/02'],
      ['2-8 Martsa 2026', '2026/03/02'],
      ['6-12 Aprily 2026', '2026/04/06'],
      ['4-10 Mey 2026', '2026/05/04'],
      ['1-7 Jona 2026', '2026/06/01'],
      ['6-12 Jolay 2026', '2026/07/06'],
      ['3-9 Aogositra 2026', '2026/08/03'],
      ['7-13 Septambra 2026', '2026/09/07'],
      ['5-11 Oktobra 2026', '2026/10/05'],
      ['2-8 Novambra 2026', '2026/11/02'],
      ['7-13 Desambra 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Jona–5 Jolay 2026', '2026/06/29'],
      ['29 Jona 2026–5 Jolay 2026', '2026/06/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4-10 Janary 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
