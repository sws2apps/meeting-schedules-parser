import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'K';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Як бігти «наввипередки з кіньми» (10 хв)', CODE);

      expect(result.fulltitle).toBe('1. Як бігти «наввипередки з кіньми»');
      expect(result.type).toBe('Як бігти «наввипередки з кіньми»');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Розвиваємо інтерес (4 хв). ВІД ДОМУ ДО ДОМУ. Господар має дітей (lmd урок 3, пункт 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Розвиваємо інтерес');
      expect(result.type).toBe('Розвиваємо інтерес');
      expect(result.src).toBe('ВІД ДОМУ ДО ДОМУ. Господар має дітей (lmd урок 3, пункт 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 Січень', 2026, '2026/01/05'],
      ['2-8 Лютий', 2026, '2026/02/02'],
      ['2-8 Березень', 2026, '2026/03/02'],
      ['6-12 Квітень', 2026, '2026/04/06'],
      ['4-10 Травень', 2026, '2026/05/04'],
      ['1-7 Червень', 2026, '2026/06/01'],
      ['6-12 Липень', 2026, '2026/07/06'],
      ['3-9 Серпень', 2026, '2026/08/03'],
      ['7-13 Вересень', 2026, '2026/09/07'],
      ['5-11 Жовтень', 2026, '2026/10/05'],
      ['2-8 Листопад', 2026, '2026/11/02'],
      ['7-13 Грудень', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Червень', 2026, '2026/06/29'],
      ['29 Грудень', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '5-11 Січнь';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5-11 Січень 2026', '2026/01/05'],
      ['2-8 Лютий 2026', '2026/02/02'],
      ['2-8 Березень 2026', '2026/03/02'],
      ['6-12 Квітень 2026', '2026/04/06'],
      ['4-10 Травень 2026', '2026/05/04'],
      ['1-7 Червень 2026', '2026/06/01'],
      ['6-12 Липень 2026', '2026/07/06'],
      ['3-9 Серпень 2026', '2026/08/03'],
      ['7-13 Вересень 2026', '2026/09/07'],
      ['5-11 Жовтень 2026', '2026/10/05'],
      ['2-8 Листопад 2026', '2026/11/02'],
      ['7-13 Грудень 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Червень-5 Липень 2026', '2026/06/29'],
      ['29 Грудень 2025-4 Січень 2026', '2025/12/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4-10 Трвень 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
