import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'CHS';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. 忠贞地对待耶和华（10 分钟）', CODE);

      expect(result.fulltitle).toBe('1. 忠贞地对待耶和华');
      expect(result.type).toBe('忠贞地对待耶和华');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced('4. 初次交谈（3 分钟）运用介绍词（lmd 第1课重点5）', CODE);

      expect(result.fulltitle).toBe('4. 初次交谈');
      expect(result.type).toBe('初次交谈');
      expect(result.src).toBe('运用介绍词（lmd 第1课重点5）');
      expect(result.time).toBe(3);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['1月5-11日', 2026, '2026/01/05'],
      ['2月2-8日', 2026, '2026/02/02'],
      ['3月2-8日', 2026, '2026/03/02'],
      ['4月6-12日', 2026, '2026/04/06'],
      ['5月4-10日', 2026, '2026/05/04'],
      ['6月1-7日', 2026, '2026/06/01'],
      ['7月6-12日', 2026, '2026/07/06'],
      ['8月3-9日', 2026, '2026/08/03'],
      ['9月7-13日', 2026, '2026/09/07'],
      ['10月5-11日', 2026, '2026/10/05'],
      ['11月2-8日', 2026, '2026/11/02'],
      ['12月7-13日', 2026, '2026/12/07'],
    ])('parses normal date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['6月29日–7月5日', 2026, '2026/06/29'],
      ['2025年12月29日–2026年1月4日', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['2026年1月5-11日', '2026/01/05'],
      ['2026年2月2-8日', '2026/02/02'],
      ['2026年3月2-8日', '2026/03/02'],
      ['2026年4月6-12日', '2026/04/06'],
      ['2026年5月4-10日', '2026/05/04'],
      ['2026年6月1-7日', '2026/06/01'],
      ['2026年7月6-12日', '2026/07/06'],
      ['2026年8月3-9日', '2026/08/03'],
      ['2026年9月7-13日', '2026/09/07'],
      ['2026年10月5-11日', '2026/10/05'],
      ['2026年11月2-8日', '2026/11/02'],
      ['2026年12月7-13日', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['2026年6月29日–7月5日', '2026/06/29'],
      ['2025年12月29日–2026年1月4日', '2025/12/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });
  });
});
