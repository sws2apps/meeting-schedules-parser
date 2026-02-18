/**
 * Removes bidirectional text control characters that are commonly inserted in RTL (right-to-left) text.
 * These invisible characters include:
 * - Zero-width space (\u200B)
 * - Left-to-right mark (\u200E) and right-to-left mark (\u200F)
 * - Arabic letter mark (\u061C)
 * - Directional formatting characters (\u202A-\u202E, \u2066-\u2069)
 *
 * Used to normalize text before parsing to avoid regex pattern mismatches caused by these hidden characters.
 */
export const stripBidiControls = (src: string) =>
  src.replace(/[\u200B\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/gu, '');

/**
 * Converts Eastern Arabic numerals to Western Arabic numerals (0-9).
 * Handles two Eastern Arabic numeral sets:
 * - Eastern-Indic digits (٠-٩, \u0660-\u0669) used in Arabic and Persian
 * - Extended Eastern-Indic digits (ٰ-٩, \u06F0-\u06F9)
 *
 * For example: ٠١٢٣٤ becomes 01234 and ۰۱۲۳۴ becomes 01234.
 * Used to normalize digit characters in parsed content so patterns and comparisons work consistently.
 */
export const normalizeEasternArabicDigits = (src: string) =>
  src.replace(/[\u0660-\u0669\u06F0-\u06F9]/gu, (char) => {
    const code = char.charCodeAt(0);

    if (code >= 0x0660 && code <= 0x0669) {
      return String(code - 0x0660);
    }

    return String(code - 0x06f0);
  });

export const buildSourcePatterns = (patternOptions: string[], variations: string): RegExp[] =>
  patternOptions.map((option) => {
    const source = option.replaceAll('{{VARIATIONS}}', variations);
    return new RegExp(source, 'iu');
  });

export const parseTitleIndex = (fulltitle: string) => {
  const nextPattern = /^(:?\d+)(?:．|.\s)(.+?)$/iu;
  const match = fulltitle.match(nextPattern);

  if (!match) {
    return fulltitle;
  }

  const groupsNextPattern = Array.from(nextPattern.exec(fulltitle)!);
  return groupsNextPattern.at(2)!.trim();
};
