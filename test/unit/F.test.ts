import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'F';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Comment « faire la course avec des chevaux » ? (10 min)', CODE);

      expect(result.fulltitle).toBe('1. Comment « faire la course avec des chevaux » ?');
      expect(result.type).toBe('Comment « faire la course avec des chevaux » ?');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. Discours (5 min) lmd appendice A idée 17. Thème : Jésus était un enseignant remarquable ; ses conseils sont toujours valables aujourd’hui (th leçon 14).',
        CODE,
      );

      expect(result.fulltitle).toBe('6. Discours');
      expect(result.type).toBe('Discours');
      expect(result.src).toBe(
        'lmd appendice A idée 17. Thème : Jésus était un enseignant remarquable ; ses conseils sont toujours valables aujourd’hui (th leçon 14).',
      );
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 janvier', 2026, '2026/01/05'],
      ['2-8 février', 2026, '2026/02/02'],
      ['2-8 mars', 2026, '2026/03/02'],
      ['6-12 avril', 2026, '2026/04/06'],
      ['4-10 mai', 2026, '2026/05/04'],
      ['1-7 juin', 2026, '2026/06/01'],
      ['6-12 juillet', 2026, '2026/07/06'],
      ['3-9 août', 2026, '2026/08/03'],
      ['7-13 septembre', 2026, '2026/09/07'],
      ['5-11 octobre', 2026, '2026/10/05'],
      ['2-8 novembre', 2026, '2026/11/02'],
      ['7-13 décembre', 2026, '2026/12/07'],
      ['1er janvier', 2026, '2026/01/01'],
    ])('parses normal date > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 juin – 5 juillet', 2026, '2026/06/29'],
      ['29 décembre 2025 – 4 janvier 2026', 2025, '2025/12/29'],
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
      ['5-11 janvier 2026', '2026/01/05'],
      ['2-8 février 2026', '2026/02/02'],
      ['2-8 mars 2026', '2026/03/02'],
      ['6-12 avril 2026', '2026/04/06'],
      ['4-10 mai 2026', '2026/05/04'],
      ['1-7 juin 2026', '2026/06/01'],
      ['6-12 juillet 2026', '2026/07/06'],
      ['3-9 août 2026', '2026/08/03'],
      ['7-13 septembre 2026', '2026/09/07'],
      ['5-11 octobre 2026', '2026/10/05'],
      ['2-8 novembre 2026', '2026/11/02'],
      ['7-13 décembre 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 juin – 5 juillet 2026', '2026/06/29'],
      ['29 décembre 2025 – 4 janvier 2026', '2025/12/29'],
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
