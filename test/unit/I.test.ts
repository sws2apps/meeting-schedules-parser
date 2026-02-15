import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'I';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Come superare qualsiasi difficoltà (10 min)', CODE);

      expect(result.fulltitle).toBe('1. Come superare qualsiasi difficoltà');
      expect(result.type).toBe('Come superare qualsiasi difficoltà');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced('8. Studio biblico di congregazione (30 min) lfb capp. 98-99', CODE);

      expect(result.fulltitle).toBe('8. Studio biblico di congregazione');
      expect(result.type).toBe('Studio biblico di congregazione');
      expect(result.src).toBe('lfb capp. 98-99');
      expect(result.time).toBe(30);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 Gennaio', 2026, '2026/01/05'],
      ['2-8 Febbraio', 2026, '2026/02/02'],
      ['2-8 Marzo', 2026, '2026/03/02'],
      ['6-12 Aprile', 2026, '2026/04/06'],
      ['4-10 Maggio', 2026, '2026/05/04'],
      ['1-7 Giugno', 2026, '2026/06/01'],
      ['6-12 Luglio', 2026, '2026/07/06'],
      ['3-9 Agosto', 2026, '2026/08/03'],
      ['7-13 Settembre', 2026, '2026/09/07'],
      ['5-11 Ottobre', 2026, '2026/10/05'],
      ['2-8 Novembre', 2026, '2026/11/02'],
      ['7-13 Dicembre', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([['29 Giugno', 2026, '2026/06/29']])('parses custom date range > %s', (src, year, expected) => {
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
      ['5-11 Gennaio 2026', '2026/01/05'],
      ['2-8 Febbraio 2026', '2026/02/02'],
      ['2-8 Marzo 2026', '2026/03/02'],
      ['6-12 Aprile 2026', '2026/04/06'],
      ['4-10 Maggio 2026', '2026/05/04'],
      ['1-7 Giugno 2026', '2026/06/01'],
      ['6-12 Luglio 2026', '2026/07/06'],
      ['3-9 Agosto 2026', '2026/08/03'],
      ['7-13 Settembre 2026', '2026/09/07'],
      ['5-11 Ottobre 2026', '2026/10/05'],
      ['2-8 Novembre 2026', '2026/11/02'],
      ['7-13 Dicembre 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Giugno-5 Luglio 2026', '2026/06/29'],
      ['29 Dicembre 2025-4 Gennaio 2026', '2025/12/29'],
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
