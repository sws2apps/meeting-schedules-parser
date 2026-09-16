import { JWEPUBParserError } from '../classes/error.js';
import { SONG_MAX } from '../constants/index.js';
import { getPartMinutesSeparatorVariations } from './language_rules.js';
import { getLanguageProfile } from '../config/language_profiles.js';
import { LanguageProfile } from '../types/index.js';
import {
  buildSourcePatterns,
  normalizeEasternArabicDigits,
  parseTitleIndex,
  stripBidiControls,
} from './source_strategies.js';

export const extractSongNumber = (src: string) => {
  const normalized = stripBidiControls(normalizeEasternArabicDigits(src));
  const parseNum = normalized.match(/(\d+)/);

  if (parseNum && parseNum.length > 0) {
    const firstNumber = +parseNum[0];

    if (firstNumber <= SONG_MAX) {
      return firstNumber;
    }
  }

  return src;
};

export const extractSongNumberWithLocale = (src: string) => {
  return { value: extractSongNumber(src), locale: extractSongNumberLocale(src) };
};

export const extractSongNumberLocale = (src: string) => {
  const normalized = stripBidiControls(normalizeEasternArabicDigits(src));
  const parseNum = normalized.match(/(\d+)/);

  if (parseNum && parseNum.length > 0) {
    const firstNumber = +parseNum[0];

    if (firstNumber <= SONG_MAX) {
      const match = src.match(/[\d\u0660-\u0669\u06F0-\u06F9]+/gu);

      if (match && match.length > 0) {
        return match[0];
      }
    }
  }

  return src;
};

const resolveFinalSource = (profile: LanguageProfile, sourceInput: string, src: string) => {
  const overrideSrc = profile.textOverrides?.[sourceInput] || profile.textOverrides?.[src];

  if (!overrideSrc) {
    return { finalSrc: src, isOverride: false };
  }

  let resolved = stripBidiControls(overrideSrc);

  if (profile.normalizers.includes('normalizeEasternArabicDigits')) {
    resolved = normalizeEasternArabicDigits(resolved);
  }

  return { finalSrc: resolved, isOverride: true };
};

const findMatchingSourcePattern = (patterns: RegExp[], src: string) => {
  for (const pattern of patterns) {
    const match = pattern.exec(src);

    if (match) {
      return { matchedPattern: pattern, groupsFirstPattern: Array.from(match) };
    }
  }

  return null;
};

const sliceOriginalTitleAndSource = (pattern: RegExp, src: string, original: string) => {
  const indexedPattern = new RegExp(
    pattern.source,
    pattern.flags.includes('d') ? pattern.flags : pattern.flags + 'd',
  );
  const index = indexedPattern.exec(src)?.indices;

  return {
    fulltitle: index?.[1] ? original.slice(index[1][0], index[1][1]).trim() : undefined,
    source: index?.[3] ? original.slice(index[3][0], index[3][1]).trim() : undefined,
  };
};

export const extractSourceEnhanced = (src: string, lang: string) => {
  const profile = getLanguageProfile(lang);
  const sourceInput = src;
  const original = stripBidiControls(src);
  src = profile.normalizers.includes('normalizeEasternArabicDigits')
    ? normalizeEasternArabicDigits(original)
    : original;

  const variations = getPartMinutesSeparatorVariations(lang);
  let { finalSrc, isOverride } = resolveFinalSource(profile, sourceInput, src);

  // Some locales encode 1-minute parts as "(minute-marker)" without an explicit digit.
  // Normalize to "(1 minute-marker)" so existing source patterns can parse time.
  const implicitOneMinutePattern = new RegExp(`([（(]\\s*)(${variations})(\\s*[）)])`, 'iu');
  const primaryMinuteMarker = variations.split('|')[0];
  finalSrc = finalSrc.replace(implicitOneMinutePattern, (_match, open, _marker, close) => {
    return `${open}1 ${primaryMinuteMarker}${close}`;
  });

  const langPatterns = buildSourcePatterns(profile.sourcePatternOptions, variations);
  const patternResults = findMatchingSourcePattern(langPatterns, finalSrc);

  if (!patternResults) {
    throw new JWEPUBParserError('meeting-schedules-parser', `Parsing failed. The input was: ${finalSrc}`);
  }

  const { matchedPattern, groupsFirstPattern } = patternResults;
  const normalizedFulltitle = groupsFirstPattern.at(1)!.trim();
  const time = +groupsFirstPattern.at(2)!.trim();
  const rawSource = groupsFirstPattern.at(3)?.trim();

  // Keep the fulltitle and src text in their original digit script as printed in
  // the publication. The part time is already extracted separately, and digit
  // normalization is a 1:1 substitution, so both groups can be sliced from the
  // original text at the same offsets. Falls back to the normalized forms on
  // overrides or when finalSrc was structurally altered (e.g. implicit-one-minute
  // insertion). type is still derived from the normalized title so the leading
  // part index can be stripped regardless of digit script.
  let fulltitle = normalizedFulltitle;
  let source = rawSource;

  if (!isOverride && finalSrc.length === original.length) {
    const originalGroups = sliceOriginalTitleAndSource(matchedPattern, finalSrc, original);

    if (originalGroups.fulltitle) {
      fulltitle = originalGroups.fulltitle;
    }

    if (originalGroups.source && source !== undefined) {
      source = originalGroups.source;
    }
  }

  const type = parseTitleIndex(normalizedFulltitle);

  return { type, src: source, time, fulltitle };
};
