import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'Q';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1.‏ איך ’‏להתחרות עם סוסים’‏ ‏(‏10 דק׳)‏', CODE);

      expect(result.fulltitle).toBe('1. איך ’להתחרות עם סוסים’');
      expect(result.type).toBe('איך ’להתחרות עם סוסים’');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6.‏ נאום ‏(‏5 דק׳)‏ למא נספח א׳ נקודה 17 — הנושא:‏ ישוע היה מורה גדול ועצותיו רלוונטיות גם כיום.‏ (‏הר שיעור 14‏)‏',
        CODE,
      );

      expect(result.fulltitle).toBe('6. נאום');
      expect(result.type).toBe('נאום');
      expect(result.src).toBe(
        'למא נספח א׳ נקודה 17 — הנושא: ישוע היה מורה גדול ועצותיו רלוונטיות גם כיום. (הר שיעור 14)',
      );
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5–11 בינואר', 2026, '2026/01/05'],
      ['2–8 בפברואר', 2026, '2026/02/02'],
      ['2–8 במרס', 2026, '2026/03/02'],
      ['6–12 באפריל', 2026, '2026/04/06'],
      ['4–10 במאי', 2026, '2026/05/04'],
      ['1–7 ביוני', 2026, '2026/06/01'],
      ['6–12 ביולי', 2026, '2026/07/06'],
      ['3–9 באוגוסט', 2026, '2026/08/03'],
      ['7–13 בספטמבר', 2026, '2026/09/07'],
      ['5–11 באוקטובר', 2026, '2026/10/05'],
      ['2–8 בנובמבר', 2026, '2026/11/02'],
      ['7–13 בדצמבר', 2026, '2026/12/07'],
    ])('parses standard date range > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: single day
    it('parses single day format', () => {
      const src = '5 בינואר';
      const result = extractMWBDate(src, 2026, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '5–11 Foobar';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W study date parsing', () => {
    // Pattern 1: standard range (all months)
    it.each([
      ['5–11 בינואר 2026', '2026/01/05'],
      ['2–8 בפברואר 2026', '2026/02/02'],
      ['2–8 במרס 2026', '2026/03/02'],
      ['6–12 באפריל 2026', '2026/04/06'],
      ['4–10 במאי 2026', '2026/05/04'],
      ['1–7 ביוני 2026', '2026/06/01'],
      ['6–12 ביולי 2026', '2026/07/06'],
      ['3–9 באוגוסט 2026', '2026/08/03'],
      ['7–13 בספטמבר 2026', '2026/09/07'],
      ['5–11 באוקטובר 2026', '2026/10/05'],
      ['2–8 בנובמבר 2026', '2026/11/02'],
      ['7–13 בדצמבר 2026', '2026/12/07'],
    ])('parses standard date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    // Pattern 2: consecutive months in same year
    it('parses day-month to day-month format', () => {
      const src = '29 ביוני–5 ביולי 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/06/29');
    });

    // Pattern 3: single day
    it('parses single day format', () => {
      const src = '5 בינואר 2026';
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe('2026/01/05');
    });

    it('throws an error for unknown month', () => {
      const src = '10–16 2027 Foobar';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
