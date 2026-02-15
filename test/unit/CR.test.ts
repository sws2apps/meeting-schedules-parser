import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'CR';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. ‘Sa moun k ap piye sa n genyen yo ap jwenn’ (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. ‘Sa moun k ap piye sa n genyen yo ap jwenn’');
      expect(result.type).toBe('‘Sa moun k ap piye sa n genyen yo ap jwenn’');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '4. Fason pou w kòmanse konvèsasyon (3 min.) TEMWAYAJ ENFÒMÈL. Kòmanse yon konvèsasyon ak yon moun ki di w yon pawòl oswa ki fè yon aksyon ki montre l janti avè w. (lmd leson 1 pwen 4)',
        CODE,
      );

      expect(result.fulltitle).toBe('4. Fason pou w kòmanse konvèsasyon');
      expect(result.type).toBe('Fason pou w kòmanse konvèsasyon');
      expect(result.src).toBe(
        'TEMWAYAJ ENFÒMÈL. Kòmanse yon konvèsasyon ak yon moun ki di w yon pawòl oswa ki fè yon aksyon ki montre l janti avè w. (lmd leson 1 pwen 4)',
      );
      expect(result.time).toBe(3);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 JANVYE', 2026, '2026/01/05'],
      ['2-8 FEVRIYE', 2026, '2026/02/02'],
      ['2-8 MAS', 2026, '2026/03/02'],
      ['6-12 AVRIL', 2026, '2026/04/06'],
      ['4-10 ME', 2026, '2026/05/04'],
      ['1-7 JEN', 2026, '2026/06/01'],
      ['6-12 JIYÈ', 2026, '2026/07/06'],
      ['3-9 OUT', 2026, '2026/08/03'],
      ['7-13 SEPTANM', 2026, '2026/09/07'],
      ['5-11 OKTÒB', 2026, '2026/10/05'],
      ['2-8 NOVANM', 2026, '2026/11/02'],
      ['7-13 DESANM', 2026, '2026/12/07'],
    ])('parses normal date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['26 JANVYE–1 FEVRIYE', 2026, '2026/01/26'],
      ['29 JEN–5 JIYÈ', 2026, '2026/06/29'],
      ['29 DESANM 2025–4 JANVYE 2026', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4-10 Foobar';
      expect(() => extractMWBDate(src, 2027, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5-11 Janvye 2026', '2026/01/05'],
      ['2-8 Fevriye 2026', '2026/02/02'],
      ['2-8 Mas 2026', '2026/03/02'],
      ['6-12 Avril 2026', '2026/04/06'],
      ['4-10 Me 2026', '2026/05/04'],
      ['1-7 Jen 2026', '2026/06/01'],
      ['6-12 Jiyè 2026', '2026/07/06'],
      ['3-9 Out 2026', '2026/08/03'],
      ['7-13 Septanm 2026', '2026/09/07'],
      ['5-11 Oktòb 2026', '2026/10/05'],
      ['2-8 Novanm 2026', '2026/11/02'],
      ['7-13 Desanm 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Jen–5 Jiyè 2026', '2026/06/29'],
      ['29 Desanm 2025–4 Janvye 2026', '2025/12/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4-10 Foobar 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
