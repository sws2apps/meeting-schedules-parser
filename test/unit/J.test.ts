import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'J';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. 「馬と競走」するには （10分）', CODE);

      expect(result.fulltitle).toBe('1. 「馬と競走」するには');
      expect(result.type).toBe('「馬と競走」するには');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. 話（5分）愛込 付録Aポイント17 主題: イエスのアドバイスは今でも役に立つ。（教励 第14課）',
        CODE,
      );

      expect(result.fulltitle).toBe('6. 話');
      expect(result.type).toBe('話');
      expect(result.src).toBe('愛込 付録Aポイント17 主題: イエスのアドバイスは今でも役に立つ。（教励 第14課）');
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['2026年1月5日', 2026, '2026/01/05'],
      ['2026年2月2日', 2026, '2026/02/02'],
      ['2026年3月2日', 2026, '2026/03/02'],
      ['2026年4月6日', 2026, '2026/04/06'],
      ['2026年5月4日', 2026, '2026/05/04'],
      ['2026年6月1日', 2026, '2026/06/01'],
      ['2026年7月6日', 2026, '2026/07/06'],
      ['2026年8月3日', 2026, '2026/08/03'],
      ['2026年9月7日', 2026, '2026/09/07'],
      ['2026年10月5日', 2026, '2026/10/05'],
      ['2026年11月2日', 2026, '2026/11/02'],
      ['2026年12月7日', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['2026年1月5', '2026/01/05'],
      ['2026年2月2', '2026/02/02'],
      ['2026年3月2', '2026/03/02'],
      ['2026年4月6', '2026/04/06'],
      ['2026年5月4', '2026/05/04'],
      ['2026年6月1', '2026/06/01'],
      ['2026年7月6', '2026/07/06'],
      ['2026年8月3', '2026/08/03'],
      ['2026年9月7', '2026/09/07'],
      ['2026年10月5', '2026/10/05'],
      ['2026年11月2', '2026/11/02'],
      ['2026年12月7', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });
  });
});
