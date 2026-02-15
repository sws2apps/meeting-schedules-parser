export const stripBidiControls = (src: string) => src.replace(/[\u200B\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/gu, '');

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
