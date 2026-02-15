import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'O';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Hoe kun je ‘het opnemen tegen paarden’? (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. Hoe kun je ‘het opnemen tegen paarden’?');
      expect(result.type).toBe('Hoe kun je ‘het opnemen tegen paarden’?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '4. Begin een gesprek (3 min.) INFORMEEL GETUIGENIS. Begin een gesprek met iemand die iets aardigs zegt of doet. (lmd les 1 punt 4)',
        CODE,
      );

      expect(result.fulltitle).toBe('4. Begin een gesprek');
      expect(result.type).toBe('Begin een gesprek');
      expect(result.src).toBe(
        'INFORMEEL GETUIGENIS. Begin een gesprek met iemand die iets aardigs zegt of doet. (lmd les 1 punt 4)',
      );
      expect(result.time).toBe(3);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5-11 januari', 2026, '2026/01/05'],
      ['2-8 februari', 2026, '2026/02/02'],
      ['2-8 maart', 2026, '2026/03/02'],
      ['6-12 april', 2026, '2026/04/06'],
      ['4-10 mei', 2026, '2026/05/04'],
      ['1-7 juni', 2026, '2026/06/01'],
      ['6-12 juli', 2026, '2026/07/06'],
      ['3-9 augustus', 2026, '2026/08/03'],
      ['7-13 september', 2026, '2026/09/07'],
      ['5-11 oktober', 2026, '2026/10/05'],
      ['2-8 november', 2026, '2026/11/02'],
      ['7-13 december', 2026, '2026/12/07'],
    ])('parses standard date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 januari';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '5-11 Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5-11 januari 2026', '2026/01/05'],
      ['2-8 februari 2026', '2026/02/02'],
      ['2-8 maart 2026', '2026/03/02'],
      ['6-12 april 2026', '2026/04/06'],
      ['4-10 mei 2026', '2026/05/04'],
      ['1-7 juni 2026', '2026/06/01'],
      ['6-12 juli 2026', '2026/07/06'],
      ['3-9 augustus 2026', '2026/08/03'],
      ['7-13 september 2026', '2026/09/07'],
      ['5-11 oktober 2026', '2026/10/05'],
      ['2-8 november 2026', '2026/11/02'],
      ['7-13 december 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months in same year
    it('parses day-month to day-month format', () => {
      const src = '29 juni–5 juli 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 januari 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '10-16 Foobar 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
