import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'LSB';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Como “disputar uma corrida contra cavalos” (10 min)', CODE);

      expect(result.fulltitle).toBe('1. Como “disputar uma corrida contra cavalos”');
      expect(result.type).toBe('Como “disputar uma corrida contra cavalos”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. Discurso (5 min) lmd A:17 — Tema: Jesus foi um grande instrutor, e seus conselhos sempre funcionam. (th lição 14)',
        CODE,
      );

      expect(result.fulltitle).toBe('6. Discurso');
      expect(result.type).toBe('Discurso');
      expect(result.src).toBe(
        'lmd A:17 — Tema: Jesus foi um grande instrutor, e seus conselhos sempre funcionam. (th lição 14)',
      );
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 de janeiro', 2026, '2026/01/05'],
      ['2-8 de fevereiro', 2026, '2026/02/02'],
      ['2-8 de março', 2026, '2026/03/02'],
      ['6-12 de abril', 2026, '2026/04/06'],
      ['4-10 de maio', 2026, '2026/05/04'],
      ['1-7 de junho', 2026, '2026/06/01'],
      ['6-12 de julho', 2026, '2026/07/06'],
      ['3-9 de agosto', 2026, '2026/08/03'],
      ['7-13 de setembro', 2026, '2026/09/07'],
      ['5-11 de outubro', 2026, '2026/10/05'],
      ['2-8 de novembro', 2026, '2026/11/02'],
      ['7-13 de dezembro', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 de junho–5 de julho', 2026, '2026/06/29'],
      ['29 de dezembro de 2025–4 de janeiro de 2026', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
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
      ['5-11 de janeiro de 2026', '2026/01/05'],
      ['2-8 de fevereiro de 2026', '2026/02/02'],
      ['2-8 de março de 2026', '2026/03/02'],
      ['6-12 de abril de 2026', '2026/04/06'],
      ['4-10 de maio de 2026', '2026/05/04'],
      ['1-7 de junho de 2026', '2026/06/01'],
      ['6-12 de julho de 2026', '2026/07/06'],
      ['3-9 de agosto de 2026', '2026/08/03'],
      ['7-13 de setembro de 2026', '2026/09/07'],
      ['5-11 de outubro de 2026', '2026/10/05'],
      ['2-8 de novembro de 2026', '2026/11/02'],
      ['7-13 de dezembro de 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 de junho-5 de julho de 2026', '2026/06/29'],
      ['29 de dezembro de 2025-4 de janeiro de 2026', '2025/12/29'],
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
