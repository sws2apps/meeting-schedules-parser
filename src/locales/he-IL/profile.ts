import { LanguageProfileConfig } from '../../types/index.js';
import { MONTH_NAME } from '../../constants/index.js';

// Language profile override for he-IL.

const mwbDatePatternOptions = [
  String.raw`\b(?<day>\d{1,2})[–](?:\d{1,2}) (?<month>${MONTH_NAME})`,
  String.raw`\b(?<day>\d{1,2}) (?<month>${MONTH_NAME})`,
];

const wDatePatternOptions = [
  String.raw`\b(?<day>\d{1,2})[–](?:\d{1,2})? (?<month>${MONTH_NAME}) (?<year>\d{4})`,
  String.raw`\b(?<day>\d{1,2}) (?<month>${MONTH_NAME})[–](?:\d{1,2}) (?:${MONTH_NAME}) (?<year>\d{4})`,
  String.raw`\b(?<day>\d{1,2}) (?<month>${MONTH_NAME}) (?<year>\d{4})`,
];

const sourcePatternOptions = [
  String.raw`(.+?)(?:: )?[（(](\d+)(?: |  | )?(?:{{VARIATIONS}})[）)](?: : | |. )?(.+?)?$`,
  String.raw`(.+?)(?:: )?[（(](?:{{VARIATIONS}})(?: |  | )?(\d+)[）)](?: : | |. )?(.+?)?$`,
];

const profile: LanguageProfileConfig = {
  direction: 'rtl',
  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  sourcePatternOptions,
  normalizers: ['stripBidiControls', 'normalizeEasternArabicDigits'],
};

export default profile;
