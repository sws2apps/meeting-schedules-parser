import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSongNumber, extractSongNumberLocale, extractSongNumberWithLocale, extractSourceEnhanced } from '../../src/common/parsing_rules.js';

describe(`common rules`, () => {
  it('parses date with year explicitely set', () => {
    const src = 'May 4-10';
    const result = extractWTStudyDate(src, 'E', 2026);
    expect(result).toBe('2026/05/04');
  });

  it('parses date with year and month explicitely set', () => {
    const src = 'January 4-10';
    const result = extractWTStudyDate(src, 'E', 2026, 11);
    expect(result).toBe('2027/01/04');
  });

  describe('song number parsing', () => {
    it('parses a western digit song number', () => {
      expect(extractSongNumber('Song 132 and Prayer')).toBe(132);
    });

    it('parses an eastern arabic digit song number', () => {
      expect(extractSongNumber('التَّرنيمَة ١٣٨ « الشَّيبَةُ تاجُ جَمال»‏')).toBe(138);
    });

    it('parses a persian-extended digit song number', () => {
      expect(extractSongNumber('سرود ۱۲۳')).toBe(123);
    });

    it('parses a large song number', () => {
      expect(extractSongNumber('Song 999')).toBe(999);
    });

    it('parses an eastern arabic digit song number above the old limit', () => {
      expect(extractSongNumber('التَّرنيمَة ٩٩٩ « الشَّيبَةُ تاجُ جَمال»\u200F')).toBe(999);
    });
  });

  describe('song number and locale parsing', () => {
    it('returns the numeric value and digit-run locale for a valid song number', () => {
      expect(extractSongNumberWithLocale('Song 132 and Prayer')).toEqual({ value: 132, locale: '132' });
    });

    it('returns the numeric value and digit-run locale for a large song number', () => {
      expect(extractSongNumberWithLocale('Song 999')).toEqual({ value: 999, locale: '999' });
    });

    it('returns the raw value and undefined locale when there is no digit run', () => {
      const src = 'Song and Prayer';
      expect(extractSongNumberWithLocale(src)).toEqual({ value: src, locale: undefined });
    });
  });

  describe('song number locale parsing', () => {
    it('returns the western digit run as-is', () => {
      expect(extractSongNumberLocale('Song 132 and Prayer')).toBe('132');
    });

    it('returns the eastern arabic digit run in its original script', () => {
      expect(extractSongNumberLocale('التَّرنيمَة ١٣٨ « الشَّيبَةُ تاجُ جَمال»‏')).toBe('١٣٨');
    });

    it('returns the persian-extended digit run in its original script', () => {
      expect(extractSongNumberLocale('سرود ۱۲۳')).toBe('۱۲۳');
    });

    it('returns undefined when there is no digit run', () => {
      expect(extractSongNumberLocale('Song and Prayer')).toBeUndefined();
    });

    it('returns the digit run for a large song number', () => {
      expect(extractSongNumberLocale('Song 999')).toBe('999');
    });
  });
});
