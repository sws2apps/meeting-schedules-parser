import { JWEPUBParserError } from '../classes/error.js';
import { getMonthNames } from './language_rules.js';
import { getLanguageProfile } from '../config/language_profiles.js';
import { normalizeEasternArabicDigits, stripBidiControls } from './source_strategies.js';
import { LanguageProfile } from '../types/index.js';

const clonePattern = (pattern: RegExp) => new RegExp(pattern.source, pattern.flags);

const normalizeDateInput = (src: string, profile: LanguageProfile) => {
  let normalized = src.trim().replace('  ', ' ').replace('\u2060', '');

  if (profile.normalizers.includes('stripBidiControls')) {
    normalized = stripBidiControls(normalized);
  }

  if (profile.normalizers.includes('normalizeEasternArabicDigits')) {
    normalized = normalizeEasternArabicDigits(normalized);
  }

  return normalized;
};

const resolveMonthIndex = (lang: string, month: string) => {
  const captured = month.toLocaleLowerCase().trim();

  return getMonthNames(lang).find((record) =>
    record.name
      .toLocaleLowerCase()
      .split('|')
      .some((variant) => {
        const normalized = variant.trim();
        return normalized === captured || normalized.split(/\s+/).includes(captured);
      })
  )?.index;
};

const getDateError = (type: 'mwb' | 'wtstudy', src: string) => {
  const prefix = type === 'mwb' ? 'Meeting Workbook' : 'Watchtower Study';

  return new JWEPUBParserError(type, `Parsing failed for ${prefix} Date. The input was: ${src}`);
};

const getDateGroups = (src: string, patterns: RegExp[], keys: string[]) => {
  for (const pattern of patterns) {
    const groups = clonePattern(pattern).exec(src)?.groups;

    if (groups && keys.every((key) => groups[key])) {
      return groups;
    }
  }

  return undefined;
};

const resolveMonthNumber = (lang: string, month: string, src: string, type: 'mwb' | 'wtstudy') => {
  if (!Number.isNaN(+month)) {
    return month;
  }

  const monthIndex = resolveMonthIndex(lang, month);

  if (monthIndex === undefined) {
    throw getDateError(type, src);
  }

  return String(monthIndex + 1);
};

export const extractMWBDate = (src: string, year: number, lang: string) => {
  const profile = getLanguageProfile(lang);
  const srcClean = normalizeDateInput(src, profile);

  const groups = getDateGroups(srcClean, profile.mwbDatePatterns, ['month', 'day']);

  if (!groups) {
    throw getDateError('mwb', src);
  }

  const month = resolveMonthNumber(lang, groups.month, src, 'mwb');

  return `${year}/${String(month).padStart(2, '0')}/${String(groups.day).padStart(2, '0')}`;
};

export const extractWTStudyDate = (src: string, lang: string, fallbackYear?: number, fallbackIssueMonth?: number) => {
  const profile = getLanguageProfile(lang);
  src = normalizeDateInput(src, profile);

  const finalSrc = profile.textOverrides?.[src] ?? src;

  const wGroups = getDateGroups(finalSrc, profile.wDatePatterns, ['year', 'month', 'day']);

  let year = wGroups?.year ?? '';
  let month = wGroups?.month ?? '';
  let date = wGroups?.day ?? '';
  let usedFallbackYear = false;

  if (!year && fallbackYear) {
    if (month && date) {
      year = String(fallbackYear);
      usedFallbackYear = true;
    } else if (!month && !date) {
      const mwbGroups = getDateGroups(finalSrc, profile.mwbDatePatterns, ['month', 'day']);

      if (mwbGroups) {
        year = String(fallbackYear);
        month = mwbGroups.month;
        date = mwbGroups.day;
        usedFallbackYear = true;
      }
    }
  }

  if (!year || !month || !date) {
    throw getDateError('wtstudy', finalSrc);
  }

  month = resolveMonthNumber(lang, month, finalSrc, 'wtstudy');

  if (usedFallbackYear && fallbackIssueMonth && +month < fallbackIssueMonth) {
    year = String(+year + 1);
  }

  return `${year}/${String(month).padStart(2, '0')}/${String(date).padStart(2, '0')}`;
};