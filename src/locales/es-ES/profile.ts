import { LanguageProfileConfig } from '../../types/index.js';
import { MONTH_NAME } from '../../constants/index.js';

// Language profile override for es-ES.

const mwbDatePatternOptions = [
  String.raw`\b(?<day>\d{1,2})[-–](?:\d{1,2}) de (?<month>${MONTH_NAME})`,
  String.raw`\b(?<day>\d{1,2}) de (?<month>${MONTH_NAME})`,
];

const wDatePatternOptions = [
  String.raw`\b(?<day>\d{1,2}) al (?:\d{1,2})? de (?<month>${MONTH_NAME}) de (?<year>\d{4})`,
  String.raw`\b(?<day>\d{1,2}) de (?<month>${MONTH_NAME}) de (?<year>\d{4})`,
];

const sourcePatternOptions = [String.raw`(.+?)(?:: )?[（(](\d+)(?: |  | )?(?:{{VARIATIONS}})[）)](?: : | |. )?(.+?)?$`];

const profile: LanguageProfileConfig = {
  direction: 'ltr',
  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  sourcePatternOptions,
  normalizers: ['stripBidiControls'],
};

export default profile;
