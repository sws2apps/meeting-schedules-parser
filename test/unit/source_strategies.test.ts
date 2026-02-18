import { describe, expect, it } from 'vitest';

import {
  stripBidiControls,
  normalizeEasternArabicDigits,
  buildSourcePatterns,
  parseTitleIndex,
} from '../../src/common/source_strategies.js';

describe('source_strategies', () => {
  describe('stripBidiControls', () => {
    it('removes zero-width space (U+200B)', () => {
      const src = 'hello\u200Bworld';
      expect(stripBidiControls(src)).toBe('helloworld');
    });

    it('removes left-to-right mark (U+200E)', () => {
      const src = 'hello\u200Eworld';
      expect(stripBidiControls(src)).toBe('helloworld');
    });

    it('removes right-to-left mark (U+200F)', () => {
      const src = 'hello\u200Fworld';
      expect(stripBidiControls(src)).toBe('helloworld');
    });

    it('removes Arabic letter mark (U+061C)', () => {
      const src = 'مرحبا\u061Cبالعالم';
      const expected = src.replace(/\u061C/g, '');
      expect(stripBidiControls(src)).toBe(expected);
    });

    it('removes left-to-right embedding (U+202A)', () => {
      const src = 'text\u202Aembedded';
      expect(stripBidiControls(src)).toBe('textembedded');
    });

    it('removes right-to-left embedding (U+202B)', () => {
      const src = 'text\u202Bembedded';
      expect(stripBidiControls(src)).toBe('textembedded');
    });

    it('removes pop directional formatting (U+202C)', () => {
      const src = 'text\u202Cclean';
      expect(stripBidiControls(src)).toBe('textclean');
    });

    it('removes left-to-right override (U+202D)', () => {
      const src = 'text\u202Doverride';
      expect(stripBidiControls(src)).toBe('textoverride');
    });

    it('removes right-to-left override (U+202E)', () => {
      const src = 'text\u202Eoverride';
      expect(stripBidiControls(src)).toBe('textoverride');
    });

    it('removes left-to-right isolate (U+2066)', () => {
      const src = 'text\u2066isolate';
      expect(stripBidiControls(src)).toBe('textisolate');
    });

    it('removes right-to-left isolate (U+2067)', () => {
      const src = 'text\u2067isolate';
      expect(stripBidiControls(src)).toBe('textisolate');
    });

    it('removes first strong isolate (U+2068)', () => {
      const src = 'text\u2068strong';
      expect(stripBidiControls(src)).toBe('textstrong');
    });

    it('removes pop directional isolate (U+2069)', () => {
      const src = 'text\u2069pop';
      expect(stripBidiControls(src)).toBe('textpop');
    });

    it('removes multiple control characters in sequence', () => {
      const src = 'hello\u200B\u200E\u200Fworld';
      expect(stripBidiControls(src)).toBe('helloworld');
    });

    it('removes multiple control characters scattered throughout', () => {
      const src = 'h\u200Bel\u200Fl\u061Co\u200Eworld';
      expect(stripBidiControls(src)).toBe('helloworld');
    });

    it('preserves text without control characters', () => {
      const src = 'helloworld';
      expect(stripBidiControls(src)).toBe('helloworld');
    });

    it('handles empty string', () => {
      expect(stripBidiControls('')).toBe('');
    });

    it('handles string with only control characters', () => {
      const src = '\u200B\u200E\u200F\u061C';
      expect(stripBidiControls(src)).toBe('');
    });
  });

  describe('normalizeEasternArabicDigits', () => {
    // Eastern-Indic digits: ٠-٩ (U+0660-U+0669)
    it('converts Eastern-Indic zero (٠)', () => {
      expect(normalizeEasternArabicDigits('٠')).toBe('0');
    });

    it('converts Eastern-Indic one (١)', () => {
      expect(normalizeEasternArabicDigits('١')).toBe('1');
    });

    it('converts Eastern-Indic nine (٩)', () => {
      expect(normalizeEasternArabicDigits('٩')).toBe('9');
    });

    it('converts full Eastern-Indic number sequence', () => {
      const src = '٠١٢٣٤٥٦٧٨٩';
      expect(normalizeEasternArabicDigits(src)).toBe('0123456789');
    });

    // Extended Eastern-Indic digits: ۰-۹ (U+06F0-U+06F9)
    it('converts Extended Eastern-Indic zero (۰)', () => {
      expect(normalizeEasternArabicDigits('۰')).toBe('0');
    });

    it('converts Extended Eastern-Indic one (۱)', () => {
      expect(normalizeEasternArabicDigits('۱')).toBe('1');
    });

    it('converts Extended Eastern-Indic nine (۹)', () => {
      expect(normalizeEasternArabicDigits('۹')).toBe('9');
    });

    it('converts full Extended Eastern-Indic number sequence', () => {
      const src = '۰۱۲۳۴۵۶۷۸۹';
      expect(normalizeEasternArabicDigits(src)).toBe('0123456789');
    });

    it('converts mixed Eastern-Indic and Extended Eastern-Indic', () => {
      const src = '٠١۲۳٤٥۶۷٨٩';
      expect(normalizeEasternArabicDigits(src)).toBe('0123456789');
    });

    it('converts date in Eastern-Indic format', () => {
      expect(normalizeEasternArabicDigits('٢٠٢٤/٠١/٠١')).toBe('2024/01/01');
    });

    it('converts date in Extended Eastern-Indic format', () => {
      expect(normalizeEasternArabicDigits('۲۰۲۴/۰۱/۰۱')).toBe('2024/01/01');
    });

    it('preserves Western digits', () => {
      const src = '0123456789';
      expect(normalizeEasternArabicDigits(src)).toBe('0123456789');
    });

    it('preserves text with Western digits', () => {
      const src = 'مرحبا 12345 عالم';
      expect(normalizeEasternArabicDigits(src)).toBe('مرحبا 12345 عالم');
    });

    it('handles empty string', () => {
      expect(normalizeEasternArabicDigits('')).toBe('');
    });

    it('preserves non-digit characters', () => {
      const src = 'hello-world_٢٠٢٤/۰۱/۰۱';
      expect(normalizeEasternArabicDigits(src)).toBe('hello-world_2024/01/01');
    });
  });

  describe('buildSourcePatterns', () => {
    it('creates single pattern from single option', () => {
      const options = ['pattern1'];
      const result = buildSourcePatterns(options, 'variations');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RegExp);
    });

    it('creates multiple patterns from multiple options', () => {
      const options = ['pattern1', 'pattern2', 'pattern3'];
      const result = buildSourcePatterns(options, 'variations');
      expect(result).toHaveLength(3);
      result.forEach((pattern) => {
        expect(pattern).toBeInstanceOf(RegExp);
      });
    });

    it('replaces {{VARIATIONS}} placeholder in pattern', () => {
      const options = ['word{{VARIATIONS}}end'];
      const variations = 'a|b|c';
      const result = buildSourcePatterns(options, variations);
      expect(result[0].source).toContain('worda|b|cend');
    });

    it('creates case-insensitive patterns (i flag)', () => {
      const options = ['Pattern'];
      const result = buildSourcePatterns(options, '');
      expect(result[0].flags).toContain('i');
    });

    it('creates unicode-aware patterns (u flag)', () => {
      const options = ['Pattern'];
      const result = buildSourcePatterns(options, '');
      expect(result[0].flags).toContain('u');
    });

    it('replaces multiple {{VARIATIONS}} placeholders', () => {
      const options = ['{{VARIATIONS}}middle{{VARIATIONS}}'];
      const variations = 'opt1|opt2';
      const result = buildSourcePatterns(options, variations);
      expect(result[0].source).toBe('opt1|opt2middleopt1|opt2');
    });

    it('handles empty pattern options array', () => {
      const options: string[] = [];
      const result = buildSourcePatterns(options, 'variations');
      expect(result).toHaveLength(0);
    });

    it('handles patterns with regex special characters', () => {
      const options = ['pattern[0-9]+'];
      const result = buildSourcePatterns(options, '');
      expect(result[0]).toBeInstanceOf(RegExp);
    });

    it('creates patterns that match case-insensitively', () => {
      const options = ['Hello'];
      const result = buildSourcePatterns(options, '');
      expect(result[0].test('hello')).toBe(true);
      expect(result[0].test('HELLO')).toBe(true);
      expect(result[0].test('Hello')).toBe(true);
    });

    it('creates patterns that handle unicode', () => {
      const options = ['שלום'];
      const result = buildSourcePatterns(options, '');
      expect(result[0].test('שלום')).toBe(true);
    });

    it('handles variations with pipe-separated options', () => {
      const options = ['word({{VARIATIONS}})'];
      const variations = 'sing|plural';
      const result = buildSourcePatterns(options, variations);
      // This creates regex: /word(sing|plural)/iu
      // In regex, this matches "word" followed by either "sing" or "plural"
      expect(result[0].test('wordsing')).toBe(true);
      expect(result[0].test('wordplural')).toBe(true);
    });

    it('builds pattern that does not modify original pattern options', () => {
      const options = ['pattern{{VARIATIONS}}'];
      const original = 'pattern{{VARIATIONS}}';
      buildSourcePatterns(options, 'vars');
      expect(options[0]).toBe(original);
    });
  });

  describe('parseTitleIndex', () => {
    it('extracts title after numeric index and period', () => {
      const result = parseTitleIndex('1. Introduction');
      expect(result).toBe('Introduction');
    });

    it('extracts title after numeric index and full-width period (．)', () => {
      const result = parseTitleIndex('1． Title');
      expect(result).toBe('Title');
    });

    it('extracts title with colon prefix in index', () => {
      const result = parseTitleIndex(':1. Title');
      expect(result).toBe('Title');
    });

    it('extracts title after index with space and separator', () => {
      const result = parseTitleIndex('2. Some Title');
      expect(result).toBe('Some Title');
    });

    it('extracts title after two-digit index', () => {
      const result = parseTitleIndex('12. Two Digit');
      expect(result).toBe('Two Digit');
    });

    it('extracts title after three-digit index', () => {
      const result = parseTitleIndex('123. Three Digit');
      expect(result).toBe('Three Digit');
    });

    it('extracts title with common separators', () => {
      const result = parseTitleIndex('1. Part Title Here');
      expect(result).toBe('Part Title Here');
    });

    it('returns full title if no index pattern found', () => {
      const src = 'No Index Title';
      expect(parseTitleIndex(src)).toBe(src);
    });

    it('returns full title if only index without separator', () => {
      const src = '1Title';
      expect(parseTitleIndex(src)).toBe(src);
    });

    it('trims trailing whitespace from extracted title', () => {
      const result = parseTitleIndex('1. Title   ');
      expect(result).toBe('Title');
    });

    it('preserves internal spaces in title', () => {
      const result = parseTitleIndex('1. Multi Word Title Here');
      expect(result).toBe('Multi Word Title Here');
    });

    it('handles title with special characters', () => {
      const result = parseTitleIndex('1. "Special" Title!');
      expect(result).toBe('"Special" Title!');
    });

    it('extracts title with punctuation in title', () => {
      const result = parseTitleIndex('1. Title: Part 1');
      expect(result).toBe('Title: Part 1');
    });

    it('case-insensitive matching', () => {
      // The pattern uses 'i' flag for case-insensitive matching
      const result = parseTitleIndex('1. UPPERCASE');
      expect(result).toBe('UPPERCASE');
    });

    it('handles empty string', () => {
      expect(parseTitleIndex('')).toBe('');
    });

    it('handles title starting with period', () => {
      const src = '.Title';
      expect(parseTitleIndex(src)).toBe(src);
    });

    it('extracts title with colon and space separator', () => {
      const result = parseTitleIndex('1: Title');
      expect(result).toBe('Title');
    });

    it('handles index with various separators after period', () => {
      const result = parseTitleIndex('1. Title');
      expect(result).toBe('Title');
    });

    it('returns entire string if pattern is not matched', () => {
      const src = 'Plain text without index';
      expect(parseTitleIndex(src)).toBe(src);
    });

    it('handles numeric text without being at start', () => {
      const src = 'Section 1. Title';
      // Should not match because pattern requires start of string
      expect(parseTitleIndex(src)).toBe(src);
    });
  });
});
