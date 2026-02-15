import enhancedLanguages from './enhanced_languages.js';
import { LanguageProfile, LanguageProfileConfig } from '../types/index.js';
import { languageStrategyOverrides } from './language_profile_overrides.js';

const profileByCode: { [code: string]: LanguageProfile } = {};

const fallbackProfileConfig: LanguageProfileConfig = {
  direction: 'ltr' as const,
  mwbDatePatterns: [],
  wDatePatterns: [],
  sourcePatternOptions: [],
  normalizers: ['stripBidiControls'],
};

for (const entry of enhancedLanguages) {
  const config = languageStrategyOverrides[entry.code];

  if (!config) {
    throw new Error(`Missing full language profile config for code ${entry.code} (${entry.locale}).`);
  }

  profileByCode[entry.code] = {
    code: entry.code,
    locale: entry.locale,
    enhanced: true,
    ...config,
  };
}

export const languageProfiles = Object.values(profileByCode);

export const getLanguageProfile = (code: string): LanguageProfile => {
  const profile = profileByCode[code];

  if (profile) {
    return profile;
  }

  return {
    code,
    locale: 'unknown',
    enhanced: false,
    ...fallbackProfileConfig,
  };
};

export const isEnhancedLanguage = (code: string) => getLanguageProfile(code).enhanced;
