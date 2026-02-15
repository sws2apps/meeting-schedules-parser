export type MWBSchedule = {
  mwb_week_date: string;
  mwb_week_date_locale?: string;
  mwb_weekly_bible_reading: string;
  mwb_song_first: number;
  mwb_tgw_talk: string;
  mwb_tgw_talk_title?: string;
  mwb_tgw_gems_title?: string;
  mwb_tgw_bread: string;
  mwb_tgw_bread_title?: string;
  mwb_ayf_count: number;
  mwb_ayf_part1: string;
  mwb_ayf_part1_time?: number;
  mwb_ayf_part1_type?: string;
  mwb_ayf_part1_title?: string;
  mwb_ayf_part2: string;
  mwb_ayf_part2_time?: number;
  mwb_ayf_part2_type?: string;
  mwb_ayf_part2_title?: string;
  mwb_ayf_part3: string;
  mwb_ayf_part3_time?: number;
  mwb_ayf_part3_type?: string;
  mwb_ayf_part3_title?: string;
  mwb_ayf_part4?: string;
  mwb_ayf_part4_time?: number;
  mwb_ayf_part4_type?: string;
  mwb_ayf_part4_title?: string;
  mwb_song_middle: number | string;
  mwb_lc_count: number;
  mwb_lc_part1: string;
  mwb_lc_part1_time?: number;
  mwb_lc_part1_content?: string;
  mwb_lc_part1_title?: string;
  mwb_lc_part2: string;
  mwb_lc_part2_time?: number;
  mwb_lc_part2_content?: string;
  mwb_lc_part2_title?: string;
  mwb_lc_cbs: string;
  mwb_lc_cbs_title?: string;
  mwb_song_conclude: number | string;
};

export type WSchedule = {
  w_study_date: string;
  w_study_date_locale?: string;
  w_study_title: string;
  w_study_opening_song?: number;
  w_study_concluding_song?: number;
};

export interface Language {
  [key: string]: {
    januaryVariations: string;
    februaryVariations: string;
    marchVariations: string;
    aprilVariations: string;
    mayVariations: string;
    juneVariations: string;
    julyVariations: string;
    augustVariations: string;
    septemberVariations: string;
    octoberVariations: string;
    novemberVariations: string;
    decemberVariations: string;
    partMinutesSeparatorVariations: string;
  };
}

export type LangRegExp = {
  [lang: string]: RegExp;
};

export type WDateParsingResult = [year: string, month: string, date: string];

export type WDateParsing = {
  [lang: string]: (groups: string[]) => WDateParsingResult;
};

export type MWBDateParsingResult = [month: string, date: string];

export type MWBDateParsing = {
  [lang: string]: (groups: string[]) => MWBDateParsingResult;
};

export type NormalizerKey = 'stripBidiControls' | 'normalizeEasternArabicDigits';

export type LanguageProfile = {
  code: string;
  locale: string;
  direction: 'ltr' | 'rtl';
  enhanced: boolean;
  mwbDatePatterns: RegExp[];
  wDatePatterns: RegExp[];
  sourcePatternOptions: string[];
  normalizers: NormalizerKey[];
  textOverrides?: Record<string, string>;
};

export type LanguageProfileConfig = Pick<
  LanguageProfile,
  'direction' | 'mwbDatePatterns' | 'wDatePatterns' | 'sourcePatternOptions' | 'normalizers' | 'textOverrides'
>;

export type LanguageStrategyOverridesMap = {
  [code: string]: LanguageProfileConfig;
};
