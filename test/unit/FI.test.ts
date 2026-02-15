import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'FI';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Otatko kaiken irti siitä mitä Jehova tarjoaa? (10 min)', CODE);

      expect(result.fulltitle).toBe('1. Otatko kaiken irti siitä mitä Jehova tarjoaa?');
      expect(result.type).toBe('Otatko kaiken irti siitä mitä Jehova tarjoaa?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. Puhe (5 min) lmd liite A kohta 16. Teema: Meidän kannattaa rukoilla usein. (th osio 8)',
        CODE,
      );

      expect(result.fulltitle).toBe('6. Puhe');
      expect(result.type).toBe('Puhe');
      expect(result.src).toBe('lmd liite A kohta 16. Teema: Meidän kannattaa rukoilla usein. (th osio 8)');
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5.–11. tammikuuta', 2026, '2026/01/05'],
      ['2.–8. helmikuuta', 2026, '2026/02/02'],
      ['2.–8. maaliskuuta', 2026, '2026/03/02'],
      ['6.–12. huhtikuuta', 2026, '2026/04/06'],
      ['4.–10. toukokuuta', 2026, '2026/05/04'],
      ['1.–7. kesäkuuta', 2026, '2026/06/01'],
      ['6.–12. heinäkuuta', 2026, '2026/07/06'],
      ['3.–9. elokuuta', 2026, '2026/08/03'],
      ['7.–13. syyskuuta', 2026, '2026/09/07'],
      ['5.–11. lokakuuta', 2026, '2026/10/05'],
      ['2.–8. marraskuuta', 2026, '2026/11/02'],
      ['7.–13. joulukuuta', 2026, '2026/12/07'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29. kesäkuuta–5. heinäkuuta', 2026, '2026/06/29'],
      ['29. joulukuuta 2025 – 4. tammikuuta 2026', 2025, '2025/12/29'],
    ])('parses custom date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '5.–11. Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5.–11. tammikuuta 2026', '2026/01/05'],
      ['2.–8. helmikuuta 2026', '2026/02/02'],
      ['2.–8. maaliskuuta 2026', '2026/03/02'],
      ['6.–12. huhtikuuta 2026', '2026/04/06'],
      ['4.–10. toukokuuta 2026', '2026/05/04'],
      ['1.–7. kesäkuuta 2026', '2026/06/01'],
      ['6.–12. heinäkuuta 2026', '2026/07/06'],
      ['3.–9. elokuuta 2026', '2026/08/03'],
      ['7.–13. syyskuuta 2026', '2026/09/07'],
      ['5.–11. lokakuuta 2026', '2026/10/05'],
      ['2.–8. marraskuuta 2026', '2026/11/02'],
      ['7.–13. joulukuuta 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29.6.–5.7.2026', '2026/06/29'],
      ['29.12.2025–4.1.2026', '2025/12/29'],
      ['29. kesäkuuta – 5. heinäkuuta 2026', '2026/07/05'],
      ['29. joulukuuta 2025 – 4. tammikuuta 2026', '2025/12/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '4.–10. Foobar 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
