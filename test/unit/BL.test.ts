import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'BL';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Верен във всичко (10 мин)', CODE);

      expect(result.fulltitle).toBe('1. Верен във всичко');
      expect(result.type).toBe('Верен във всичко');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '4. Първоначално посещение (3 мин) Проповядвай от врата на врата. (lmd урок 1, точка 5)',
        CODE,
      );

      expect(result.fulltitle).toBe('4. Първоначално посещение');
      expect(result.type).toBe('Първоначално посещение');
      expect(result.src).toBe('Проповядвай от врата на врата. (lmd урок 1, точка 5)');
      expect(result.time).toBe(3);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 януари', 2026, '2026/01/05'],
      ['2-8 февруари', 2026, '2026/02/02'],
      ['2-8 март', 2026, '2026/03/02'],
      ['6-12 април', 2026, '2026/04/06'],
      ['4-10 май', 2026, '2026/05/04'],
      ['1-7 юни', 2026, '2026/06/01'],
      ['6-12 юли', 2026, '2026/07/06'],
      ['3-9 август', 2026, '2026/08/03'],
      ['7-13 септември', 2026, '2026/09/07'],
      ['5-11 октомври', 2026, '2026/10/05'],
      ['2-8 ноември', 2026, '2026/11/02'],
      ['7-13 декември', 2026, '2026/12/07'],
    ])('parses normal date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 юни — 5 юли', 2026, '2026/06/29'],
      ['29 декември 2025 — 4 януари 2026', 2026, '2026/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4-10 януаи';
      expect(() => extractMWBDate(src, 2027, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5-11 януари 2026', '2026/01/05'],
      ['2-8 февруари 2026', '2026/02/02'],
      ['2-8 март 2026', '2026/03/02'],
      ['6-12 април 2026', '2026/04/06'],
      ['4-10 май 2026', '2026/05/04'],
      ['1-7 юни 2026', '2026/06/01'],
      ['6-12 юли 2026', '2026/07/06'],
      ['3-9 август 2026', '2026/08/03'],
      ['7-13 септември 2026', '2026/09/07'],
      ['5-11 октомври 2026', '2026/10/05'],
      ['2-8 ноември 2026', '2026/11/02'],
      ['7-13 декември 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 юни — 5 юли 2026', '2026/06/29'],
      ['29 юни 2026 — 5 юли 2026', '2026/06/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '5-11 янари 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
