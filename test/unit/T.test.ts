import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'T';

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
        '5. Cultivando o interesse (4 min) DE CASA EM CASA. A pessoa é pai ou mãe. (lmd lição 3 ponto 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Cultivando o interesse');
      expect(result.type).toBe('Cultivando o interesse');
      expect(result.src).toBe('DE CASA EM CASA. A pessoa é pai ou mãe. (lmd lição 3 ponto 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: standard range (all months)
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
    ])('parses standard date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 de janeiro';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 de Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: standard range (all months)
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
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months in same year
    it('parses day-month to day-month format', () => {
      const src = '29 de junho-5 de julho de 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 de janeiro de 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    // Invalid month check
    it('throws an error for unknown month', () => {
      const src = '5-11 de Foobar de 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
