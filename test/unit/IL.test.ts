import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'IL';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. No Kasano ti “Makilumba Kadagiti Kabalio” (10 min.)', CODE);

      expect(result.fulltitle).toBe('1. No Kasano ti “Makilumba Kadagiti Kabalio”');
      expect(result.type).toBe('No Kasano ti “Makilumba Kadagiti Kabalio”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Pannakisarita Manen (4 min.) PANAGBALAYBALAY. Ti bumalay ket maysa a nagannak. (lmd leksion 3 punto 3)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Pannakisarita Manen');
      expect(result.type).toBe('Pannakisarita Manen');
      expect(result.src).toBe('PANAGBALAYBALAY. Ti bumalay ket maysa a nagannak. (lmd leksion 3 punto 3)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['Enero 5', 2026, '2026/01/05'],
      ['Pebrero 2', 2026, '2026/02/02'],
      ['Marso 2', 2026, '2026/03/02'],
      ['Abril 6', 2026, '2026/04/06'],
      ['Mayo 4', 2026, '2026/05/04'],
      ['Hunio 1', 2026, '2026/06/01'],
      ['Hulio 6', 2026, '2026/07/06'],
      ['Agosto 3', 2026, '2026/08/03'],
      ['Septiembre 7', 2026, '2026/09/07'],
      ['Oktubre 5', 2026, '2026/10/05'],
      ['Nobyembre 2', 2026, '2026/11/02'],
      ['Disiembre 7', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
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
      ['Enero 5-11, 2026', '2026/01/05'],
      ['Pebrero 2-8, 2026', '2026/02/02'],
      ['Marso 2-8, 2026', '2026/03/02'],
      ['Abril 6-12, 2026', '2026/04/06'],
      ['Mayo 4-10, 2026', '2026/05/04'],
      ['Hunio 1-7, 2026', '2026/06/01'],
      ['Hulio 6-12, 2026', '2026/07/06'],
      ['Agosto 3-9, 2026', '2026/08/03'],
      ['Septiembre 7-13, 2026', '2026/09/07'],
      ['Oktubre 5-11, 2026', '2026/10/05'],
      ['Nobyembre 2-8, 2026', '2026/11/02'],
      ['Disiembre 7-13, 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['Hunio 29-Hulio 5, 2026', '2026/06/29'],
      ['Disiembre 29, 2025-Enero 4, 2026', '2025/12/29'],
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
