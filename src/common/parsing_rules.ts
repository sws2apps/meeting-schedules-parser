import { JWEPUBParserError } from '../classes/error.js';
import { LangRegExp } from '../types/index.js';
import { getPartMinutesSeparatorVariations } from './language_rules.js';
import overrides from './override.js';

export const extractSongNumber = (src: string) => {
  const parseNum = src.match(/(\d+)/);

  if (parseNum && parseNum.length > 0) {
    const firstNumber = +parseNum[0];

    if (firstNumber <= 161) {
      return firstNumber;
    }
  }

  return src;
};

export const extractSourceEnhanced = (src: string, lang: string) => {
  src = src.replace(/(\u200B)*(\d+)(\u200B)*/g, '$2');

  const variations = getPartMinutesSeparatorVariations(lang);

  let finalSrc = src;

  const overrideLang = overrides[lang];

  if (overrideLang) {
    const overrideSrc = overrideLang[src];

    if (overrideSrc) {
      finalSrc = overrideSrc;
    }
  }

  // separate minutes from title
  const firstPatternCommon = new RegExp(
    `(.+?)(?:: )?[（(](\\d+)(?: |  | )?(?:${variations})[）)](?: : | |. )?(.+?)?$`,
    'giu'
  );

  const firstPatternCommonPGW = new RegExp(
    `(.+?)(?:: )?[（(](\\d+)(?: |  )?(?:${variations})[）)]?(?: : | |. )?(.+?)?$`,
    'giu'
  );

  const firstPatternTW = new RegExp(`(.+?)(?: )?\\((?:${variations})(?: |  )?(\\d+).?\\)(?: |.)?(.+?)?$`, 'giu');

  const firstPattern: LangRegExp = {
    common: firstPatternCommon,
    PGW: firstPatternCommonPGW,
    SW: firstPatternTW,
    TW: firstPatternTW,
    YW: firstPatternTW,
  };

  const langPattern = firstPattern[lang] || firstPattern.common;

  const matchFirstPattern = finalSrc.match(langPattern);

  if (!matchFirstPattern) {
    throw new JWEPUBParserError('meeting-schedules-parser', `Parsing failed. The input was: ${finalSrc}`);
  }

  const groupsFirstPattern = Array.from(langPattern.exec(finalSrc)!);

  const fulltitle = groupsFirstPattern.at(1)!.trim();
  const time = +groupsFirstPattern.at(2)!.trim();
  const source = groupsFirstPattern.at(3)?.trim();

  // separate index from title
  const nextPattern = /^(:?\d+)(?:．|.\s)(.+?)$/giu;

  const matchNextPattern = fulltitle.match(nextPattern);

  let type = fulltitle;

  if (matchNextPattern) {
    const groupsNextPattern = Array.from(nextPattern.exec(fulltitle)!);
    type = groupsNextPattern.at(2)!.trim();
  }

  return { type, src: source, time, fulltitle };
};
