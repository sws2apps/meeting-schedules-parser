import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'LSE';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Cómo “competir en una carrera contra caballos” (10 mins.)', CODE);

      expect(result.fulltitle).toBe('1. Cómo “competir en una carrera contra caballos”');
      expect(result.type).toBe('Cómo “competir en una carrera contra caballos”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Haga revisitas (4 mins.) DE CASA EN CASA. La persona tiene hijos (lmd 3:3).',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Haga revisitas');
      expect(result.type).toBe('Haga revisitas');
      expect(result.src).toBe('DE CASA EN CASA. La persona tiene hijos (lmd 3:3).');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 de Enero', 2026, '2026/01/05'],
      ['2-8 de Febrero', 2026, '2026/02/02'],
      ['2-8 de Marzo', 2026, '2026/03/02'],
      ['6-12 de Abril', 2026, '2026/04/06'],
      ['4-10 de Mayo', 2026, '2026/05/04'],
      ['1-7 de Junio', 2026, '2026/06/01'],
      ['6-12 de Julio', 2026, '2026/07/06'],
      ['3-9 de Agosto', 2026, '2026/08/03'],
      ['7-13 de Septiembre', 2026, '2026/09/07'],
      ['5-11 de Octubre', 2026, '2026/10/05'],
      ['2-8 de Noviembre', 2026, '2026/11/02'],
      ['7-13 de Diciembre', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([['29 de Junio', 2026, '2026/06/29']])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '5-11 de Eero';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5 al 11 de Enero de 2026', '2026/01/05'],
      ['2 al 8 de Febrero de 2026', '2026/02/02'],
      ['2 al 8 de Marzo de 2026', '2026/03/02'],
      ['6 al 12 de Abril de 2026', '2026/04/06'],
      ['4 al 10 de Mayo de 2026', '2026/05/04'],
      ['1 al 7 de Junio de 2026', '2026/06/01'],
      ['6 al 12 de Julio de 2026', '2026/07/06'],
      ['3 al 9 de Agosto de 2026', '2026/08/03'],
      ['7 al 13 de Septiembre de 2026', '2026/09/07'],
      ['5 al 11 de Octubre de 2026', '2026/10/05'],
      ['2 al 8 de Noviembre de 2026', '2026/11/02'],
      ['7 al 13 de Diciembre de 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([['29 de Diciembre de 2025', '2025/12/29']])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = 'Foobar 10-16, 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
