import { JWEPUBParserError } from '../classes/error.js';
import { SONG_MAX } from '../constants/index.js';
import { getPartMinutesSeparatorVariations } from './language_rules.js';
import { getLanguageProfile } from '../config/language_profiles.js';
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

  return normalized;
};

export const extractSongNumberLocale = (src: string) => {
  const match = src.match(/[\d\u0660-\u0669\u06F0-\u06F9]+/gu);

  if (match === null || match.length === 0) {
    return undefined;
  }

  return match[0];
};

export const extractSourceEnhanced = (src: string, lang: string) => {
  const profile = getLanguageProfile(lang);
  const sourceInput = src;
  const original = stripBidiControls(src);

  if (profile.normalizers.includes('normalizeEasternArabicDigits')) {
    src = normalizeEasternArabicDigits(original);
  } else {
    src = original;
  }

  const variations = getPartMinutesSeparatorVariations(lang);

  let finalSrc = src;

  const overrideSrc = profile.textOverrides?.[sourceInput] || profile.textOverrides?.[src];

  if (overrideSrc) {
    finalSrc = stripBidiControls(overrideSrc);

    if (profile.normalizers.includes('normalizeEasternArabicDigits')) {
      finalSrc = normalizeEasternArabicDigits(finalSrc);
    }
  }

  // Some locales encode 1-minute parts as "(minute-marker)" without an explicit digit.
  // Normalize to "(1 minute-marker)" so existing source patterns can parse time.
  const implicitOneMinutePattern = new RegExp(`([（(]\\s*)(${variations})(\\s*[）)])`, 'iu');
  const primaryMinuteMarker = variations.split('|')[0];
  finalSrc = finalSrc.replace(implicitOneMinutePattern, (_match, open, _marker, close) => {
    return `${open}1 ${primaryMinuteMarker}${close}`;
  });

  const langPatterns = buildSourcePatterns(profile.sourcePatternOptions, variations);
  let matchedPattern: RegExp | null = null;
  let groupsFirstPattern: string[] | null = null;

  for (const langPattern of langPatterns) {
    const match = langPattern.exec(finalSrc);

    if (match) {
      matchedPattern = langPattern;
      groupsFirstPattern = Array.from(match);
      break;
    }
  }

  if (!groupsFirstPattern || !matchedPattern) {
    throw new JWEPUBParserError('meeting-schedules-parser', `Parsing failed. The input was: ${finalSrc}`);
  }

  const normalizedFulltitle = groupsFirstPattern.at(1)!.trim();
  const time = +groupsFirstPattern.at(2)!.trim();
  let source = groupsFirstPattern.at(3)?.trim();

  // Keep the fulltitle and src text in their original digit script as printed in
  // the publication. The part time is already extracted separately, and digit
  // normalization is a 1:1 substitution, so both groups can be sliced from the
  // original text at the same offsets. Falls back to the normalized forms on
  // overrides or when finalSrc was structurally altered (e.g. implicit-one-minute
  // insertion). type is still derived from the normalized title so the leading
  // part index can be stripped regardless of digit script.
  let fulltitle = normalizedFulltitle;

  if (!overrideSrc && finalSrc.length === original.length) {
    const indexedPattern = new RegExp(matchedPattern.source, matchedPattern.flags.includes('d') ? matchedPattern.flags : matchedPattern.flags + 'd');
    const indexedMatch = indexedPattern.exec(finalSrc);
    const titleIndices = indexedMatch?.indices?.[1];
    const sourceIndices = indexedMatch?.indices?.[3];

    if (titleIndices) {
      fulltitle = original.slice(titleIndices[0], titleIndices[1]).trim();
    }

    if (sourceIndices && source !== undefined) {
      source = original.slice(sourceIndices[0], sourceIndices[1]).trim();
    }
  }

  const type = parseTitleIndex(normalizedFulltitle);

  return { type, src: source, time, fulltitle };
};
