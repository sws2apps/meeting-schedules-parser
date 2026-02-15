import { LanguageProfileConfig } from '../../types/index.js';

// Language profile override for ko-KR.

const mwbDatePatternOptions = [
  String.raw`(?<month>\d{1,2})월 (?<day>\d{1,2})`,
  String.raw`(?:\d{4})년 (?<month>\d{1,2})월 (?<day>\d{1,2})일`,
];

const wDatePatternOptions = [String.raw`(?<year>\d{4})년 (?<month>\d{1,2})월 (?<day>\d{1,2})`];

const sourcePatternOptions = [String.raw`(.+?)(?:: )?[（(](\d+)(?: |  | )?(?:{{VARIATIONS}})[）)](?: : | |. )?(.+?)?$`];

const profile: LanguageProfileConfig = {
  direction: 'ltr',
  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  sourcePatternOptions,
  normalizers: ['stripBidiControls'],
};

export default profile;
