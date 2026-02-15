import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'KO';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. “말과 경주”하는 방법 (10분)', CODE);

      expect(result.fulltitle).toBe('1. “말과 경주”하는 방법');
      expect(result.type).toBe('“말과 경주”하는 방법');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '4. 대화 시작하기 (3분) 비공식 증거. 전도인에게 친절한 말이나 행동을 한 사람과 대화를 시작한다. (「랑제」 1과 요점 4)',
        CODE,
      );

      expect(result.fulltitle).toBe('4. 대화 시작하기');
      expect(result.type).toBe('대화 시작하기');
      expect(result.src).toBe(
        '비공식 증거. 전도인에게 친절한 말이나 행동을 한 사람과 대화를 시작한다. (「랑제」 1과 요점 4)',
      );
      expect(result.time).toBe(3);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['2026년 1월 5일', 2026, '2026/01/05'],
      ['2026년 2월 2일', 2026, '2026/02/02'],
      ['2026년 3월 2일', 2026, '2026/03/02'],
      ['2026년 4월 6일', 2026, '2026/04/06'],
      ['2026년 5월 4일', 2026, '2026/05/04'],
      ['2026년 6월 1일', 2026, '2026/06/01'],
      ['2026년 7월 6일', 2026, '2026/07/06'],
      ['2026년 8월 3일', 2026, '2026/08/03'],
      ['2026년 9월 7일', 2026, '2026/09/07'],
      ['2026년 10월 5일', 2026, '2026/10/05'],
      ['2026년 11월 2일', 2026, '2026/11/02'],
      ['2026년 12월 7일', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['2026년 1월 5', '2026/01/05'],
      ['2026년 2월 2', '2026/02/02'],
      ['2026년 3월 2', '2026/03/02'],
      ['2026년 4월 6', '2026/04/06'],
      ['2026년 5월 4', '2026/05/04'],
      ['2026년 6월 1', '2026/06/01'],
      ['2026년 7월 6', '2026/07/06'],
      ['2026년 8월 3', '2026/08/03'],
      ['2026년 9월 7', '2026/09/07'],
      ['2026년 10월 5', '2026/10/05'],
      ['2026년 11월 2', '2026/11/02'],
      ['2026년 12월 7', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });
  });
});
