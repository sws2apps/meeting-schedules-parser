import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'H';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. „Hogyan tudsz majd lovakkal versenyt futni?” (10 perc)', CODE);

      expect(result.fulltitle).toBe('1. „Hogyan tudsz majd lovakkal versenyt futni?”');
      expect(result.type).toBe('„Hogyan tudsz majd lovakkal versenyt futni?”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. Előadás (5 perc) lmd „A” függelék, 17. pont. Téma: Jézus nagyszerű tanító volt, és a tanácsai napjainkban is hasznosak. (th 14. szempont)',
        CODE,
      );

      expect(result.fulltitle).toBe('6. Előadás');
      expect(result.type).toBe('Előadás');
      expect(result.src).toBe(
        'lmd „A” függelék, 17. pont. Téma: Jézus nagyszerű tanító volt, és a tanácsai napjainkban is hasznosak. (th 14. szempont)',
      );
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['Január 5.', 2026, '2026/01/05'],
      ['Február 2.', 2026, '2026/02/02'],
      ['Március 2.', 2026, '2026/03/02'],
      ['Április 6.', 2026, '2026/04/06'],
      ['Május 4.', 2026, '2026/05/04'],
      ['Június 1.', 2026, '2026/06/01'],
      ['Július 6.', 2026, '2026/07/06'],
      ['Augusztus 3.', 2026, '2026/08/03'],
      ['Szeptember 7.', 2026, '2026/09/07'],
      ['Október 5.', 2026, '2026/10/05'],
      ['November 2.', 2026, '2026/11/02'],
      ['December 7.', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([['2026. Június 29.', 2026, '2026/06/29']])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = 'Júnis 5';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['2026. Január 5', '2026/01/05'],
      ['2026. Február 2', '2026/02/02'],
      ['2026. Március 2', '2026/03/02'],
      ['2026. Április 6', '2026/04/06'],
      ['2026. Május 4', '2026/05/04'],
      ['2026. Június 1', '2026/06/01'],
      ['2026. Július 6', '2026/07/06'],
      ['2026. Augusztus 3', '2026/08/03'],
      ['2026. Szeptember 7', '2026/09/07'],
      ['2026. Október 5', '2026/10/05'],
      ['2026. November 2', '2026/11/02'],
      ['2026. December 7', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '2026. Janur 5';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
