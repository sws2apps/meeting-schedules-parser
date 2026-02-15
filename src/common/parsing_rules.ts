import { JWEPUBParserError } from '../classes/error.js';
import { getPartMinutesSeparatorVariations } from './language_rules.js';
import { getLanguageProfile } from '../config/language_profiles.js';
import {
  buildSourcePatterns,
  normalizeEasternArabicDigits,
  parseTitleIndex,
  stripBidiControls,
} from './source_strategies.js';

export const extractSongNumber = (src: string) => {
  const parseNum = src.match(/(\d+)/);

  if (parseNum && parseNum.length > 0) {
    const firstNumber = +parseNum[0];

    if (firstNumber <= 162) {
      return firstNumber;
    }
  }

  return src;
};

export const extractSourceEnhanced = (src: string, lang: string) => {
  const profile = getLanguageProfile(lang);
  const sourceInput = src;
  src = stripBidiControls(src);

  if (profile.normalizers.includes('normalizeEasternArabicDigits')) {
    src = normalizeEasternArabicDigits(src);
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
  let groupsFirstPattern: string[] | null = null;

  for (const langPattern of langPatterns) {
    const match = langPattern.exec(finalSrc);

    if (match) {
      groupsFirstPattern = Array.from(match);
      break;
    }
  }

  if (!groupsFirstPattern) {
    throw new JWEPUBParserError('meeting-schedules-parser', `Parsing failed. The input was: ${finalSrc}`);
  }

  const fulltitle = groupsFirstPattern.at(1)!.trim();
  const time = +groupsFirstPattern.at(2)!.trim();
  const source = groupsFirstPattern.at(3)?.trim();
  const type = parseTitleIndex(fulltitle);

  return { type, src: source, time, fulltitle };
};
