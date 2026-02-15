import { LanguageProfileConfig } from '../../types/index.js';
import { MONTH_NAME } from '../../constants/index.js';

// Language profile override for hu-HU.

const mwbDatePatternOptions = [
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})`,
  String.raw`(?:\d{4})\. (?<month>${MONTH_NAME}) (?<day>\d{1,2})`,
];

const wDatePatternOptions = [String.raw`(?<year>\d{4})\. (?<month>${MONTH_NAME}) (?<day>\d{1,2})`];

const sourcePatternOptions = [String.raw`(.+?)(?:: )?[（(](\d+)(?: |  | )?(?:{{VARIATIONS}})[）)](?: : | |. )?(.+?)?$`];

const profile: LanguageProfileConfig = {
  direction: 'ltr',
  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  sourcePatternOptions,
  normalizers: ['stripBidiControls'],
};

export default profile;
