import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'VT';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Làm thế nào để ‘chạy đua với ngựa’? (10 phút)', CODE);

      expect(result.fulltitle).toBe('1. Làm thế nào để ‘chạy đua với ngựa’?');
      expect(result.type).toBe('Làm thế nào để ‘chạy đua với ngựa’?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Thăm lại (4 phút) Thăm lại người mà anh chị gặp khi đi rao giảng từng nhà. Chủ nhà là bậc cha mẹ. (lmd bài 3 điểm 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Thăm lại');
      expect(result.type).toBe('Thăm lại');
      expect(result.src).toBe(
        'Thăm lại người mà anh chị gặp khi đi rao giảng từng nhà. Chủ nhà là bậc cha mẹ. (lmd bài 3 điểm 3)',
      );
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 tháng 1', 2026, '2026/01/05'],
      ['2-8 tháng 2', 2026, '2026/02/02'],
      ['2-8 tháng 3', 2026, '2026/03/02'],
      ['6-12 tháng 4', 2026, '2026/04/06'],
      ['4-10 tháng 5', 2026, '2026/05/04'],
      ['1-7 tháng 6', 2026, '2026/06/01'],
      ['6-12 tháng 7', 2026, '2026/07/06'],
      ['3-9 tháng 8', 2026, '2026/08/03'],
      ['7-13 tháng 9', 2026, '2026/09/07'],
      ['5-11 tháng 10', 2026, '2026/10/05'],
      ['2-8 tháng 11', 2026, '2026/11/02'],
      ['7-13 tháng 12', 2026, '2026/12/07'],
    ])('parses range format > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 tháng 1';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 tháng Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: range
    it.each([
      ['5-11 tháng 1 năm 2026', '2026/01/05'],
      ['2-8 tháng 2 năm 2026', '2026/02/02'],
      ['2-8 tháng 3 năm 2026', '2026/03/02'],
      ['6-12 tháng 4 năm 2026', '2026/04/06'],
      ['4-10 tháng 5 năm 2026', '2026/05/04'],
      ['1-7 tháng 6 năm 2026', '2026/06/01'],
      ['6-12 tháng 7 năm 2026', '2026/07/06'],
      ['3-9 tháng 8 năm 2026', '2026/08/03'],
      ['7-13 tháng 9 năm 2026', '2026/09/07'],
      ['5-11 tháng 10 năm 2026', '2026/10/05'],
      ['2-8 tháng 11 năm 2026', '2026/11/02'],
      ['7-13 tháng 12 năm 2026', '2026/12/07'],
    ])('parses range format > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 tháng 1 năm 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 tháng Foobar năm 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
