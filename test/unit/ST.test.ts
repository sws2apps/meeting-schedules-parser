import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'ST';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Kuidas võidu joosta hobustega? (10 min)', CODE);

      expect(result.fulltitle).toBe('1. Kuidas võidu joosta hobustega?');
      expect(result.type).toBe('Kuidas võidu joosta hobustega?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '5. Vestluse jätkamine (4 min) MAJAST MAJJA. Vestluskaaslane on lapsevanem (lmd, 3. õppetükk, 3. punkt)',
        CODE,
      );

      expect(result.fulltitle).toBe('5. Vestluse jätkamine');
      expect(result.type).toBe('Vestluse jätkamine');
      expect(result.src).toBe('MAJAST MAJJA. Vestluskaaslane on lapsevanem (lmd, 3. õppetükk, 3. punkt)');
      expect(result.time).toBe(4);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5.–11. jaanuar', 2026, '2026/01/05'],
      ['2.–8. veebruar', 2026, '2026/02/02'],
      ['2.–8. märts', 2026, '2026/03/02'],
      ['6.–12. aprill', 2026, '2026/04/06'],
      ['4.–10. mai', 2026, '2026/05/04'],
      ['1.–7. juuni', 2026, '2026/06/01'],
      ['6.–12. juuli', 2026, '2026/07/06'],
      ['3.–9. august', 2026, '2026/08/03'],
      ['7.–13. september', 2026, '2026/09/07'],
      ['5.–11. oktoober', 2026, '2026/10/05'],
      ['2.–8. november', 2026, '2026/11/02'],
      ['7.–13. detsember', 2026, '2026/12/07'],
    ])('parses standard date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5. jaanuar';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '5.–11. foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5.–11. jaanuar 2026', '2026/01/05'],
      ['2.–8. veebruar 2026', '2026/02/02'],
      ['2.–8. märts 2026', '2026/03/02'],
      ['6.–12. aprill 2026', '2026/04/06'],
      ['4.–10. mai 2026', '2026/05/04'],
      ['1.–7. juuni 2026', '2026/06/01'],
      ['6.–12. juuli 2026', '2026/07/06'],
      ['3.–9. august 2026', '2026/08/03'],
      ['7.–13. september 2026', '2026/09/07'],
      ['5.–11. oktoober 2026', '2026/10/05'],
      ['2.–8. november 2026', '2026/11/02'],
      ['7.–13. detsember 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months in same year
    it('parses day-month to day-month format', () => {
      const src = '29. juuni–5. juuli 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5. jaanuar 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '10.–16. foobar 2027';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
