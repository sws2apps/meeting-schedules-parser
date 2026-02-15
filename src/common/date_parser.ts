import { JWEPUBParserError } from '../classes/error.js';
import { getMonthNames } from './language_rules.js';
import { getLanguageProfile } from '../config/language_profiles.js';

const clonePattern = (pattern: RegExp) => new RegExp(pattern.source, pattern.flags);

const normalizeDateInput = (src: string) => {
  return src
    .trim()
    .replace('  ', ' ')
    .replace('​', '')
    .replace('⁠', '')
    .replace(/\u200F/g, '')
    .replace(/\u200B/g, '');
};

export const extractMWBDate = (src: string, year: number, lang: string) => {
  const profile = getLanguageProfile(lang);
  const srcClean = normalizeDateInput(src);
  let month = '';
  let date = '';

  for (const pattern of profile.mwbDatePatterns) {
    const datePattern = clonePattern(pattern);
    const match = datePattern.exec(srcClean);
    const groups = match?.groups;

    if (!groups?.month || !groups?.day) {
      continue;
    }

    month = groups.month;
    date = groups.day;
    break;
  }

  if (!month || !date) {
    throw new JWEPUBParserError('mwb', `Parsing failed for Meeting Workbook Date. The input was: ${src}`);
  }

  if (isNaN(+month)) {
    const months = getMonthNames(lang);
    const monthIndex = months.find((record) => record.name.toLocaleLowerCase().includes(month.toLowerCase()))?.index;

    if (monthIndex === undefined) {
      throw new JWEPUBParserError('wtstudy', `Parsing failed for Meeting Workbook Date. The input was: ${src}`);
    }

    month = String(monthIndex + 1);
  }

  return `${year}/${String(month).padStart(2, '0')}/${String(date).padStart(2, '0')}`;
};

export const extractWTStudyDate = (src: string, lang: string, fallbackYear?: number, fallbackIssueMonth?: number) => {
  const profile = getLanguageProfile(lang);
  src = normalizeDateInput(src);

  let finalSrc = src;
  const overrideSrc = profile.textOverrides?.[src];

  if (overrideSrc) {
    finalSrc = overrideSrc;
  }

  let year = '';
  let month = '';
  let date = '';
  let usedFallbackYear = false;

  for (const pattern of profile.wDatePatterns) {
    const datePattern = clonePattern(pattern);
    const match = datePattern.exec(finalSrc);
    const groups = match?.groups;

    if (!groups?.year || !groups?.month || !groups?.day) {
      continue;
    }

    year = groups.year;
    month = groups.month;
    date = groups.day;
    break;
  }

  if (!year && fallbackYear && month && date) {
    year = String(fallbackYear);
    usedFallbackYear = true;
  }

  // Some W TOC entries omit the year (e.g., "11-17 grudnia").
  // Reuse MWB day/month patterns for that case and apply fallback year.
  if (!year && !month && !date && fallbackYear) {
    for (const pattern of profile.mwbDatePatterns) {
      const datePattern = clonePattern(pattern);
      const match = datePattern.exec(finalSrc);
      const groups = match?.groups;

      if (!groups?.month || !groups?.day) {
        continue;
      }

      year = String(fallbackYear);
      month = groups.month;
      date = groups.day;
      usedFallbackYear = true;
      break;
    }
  }

  if (!year || !month || !date) {
    throw new JWEPUBParserError('wtstudy', `Parsing failed for Watchtower Study Date. The input was: ${finalSrc}`);
  }

  if (isNaN(+month)) {
    const months = getMonthNames(lang);
    const monthIndex = months.find((record) => record.name.toLocaleLowerCase().includes(month.toLowerCase()))?.index;

    if (monthIndex === undefined) {
      throw new JWEPUBParserError('wtstudy', `Parsing failed for Watchtower Study Date. The input was: ${finalSrc}`);
    }

    month = String(monthIndex + 1);
  }

  if (usedFallbackYear && fallbackIssueMonth && +month < fallbackIssueMonth) {
    year = String(+year + 1);
  }

  return `${year}/${String(month).padStart(2, '0')}/${String(date).padStart(2, '0')}`;
};
