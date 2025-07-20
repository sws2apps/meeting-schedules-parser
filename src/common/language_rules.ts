import { Language } from '../types/index.js';

const languages: Language = meeting_schedules_parser.languages;

export const getMonthNames = (lang: string) => {
  return [
    { index: 0, name: languages[lang].januaryVariations },
    { index: 1, name: languages[lang].februaryVariations },
    { index: 2, name: languages[lang].marchVariations },
    { index: 3, name: languages[lang].aprilVariations },
    { index: 4, name: languages[lang].mayVariations },
    { index: 5, name: languages[lang].juneVariations },
    { index: 6, name: languages[lang].julyVariations },
    { index: 7, name: languages[lang].augustVariations },
    { index: 8, name: languages[lang].septemberVariations },
    { index: 9, name: languages[lang].octoberVariations },
    { index: 10, name: languages[lang].novemberVariations },
    { index: 11, name: languages[lang].decemberVariations },
  ];
};

export const getPartMinutesSeparatorVariations = (lang: string) => languages[lang].partMinutesSeparatorVariations;
