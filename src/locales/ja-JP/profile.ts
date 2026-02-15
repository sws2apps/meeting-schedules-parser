import { LanguageProfileConfig } from '../../types/index.js';

// Language profile override for ja-JP.

const mwbDatePatternOptions = [
  String.raw`(?<month>\d{1,2})月(?<day>\d{1,2})`,
  String.raw`(?:\d{4})年(?<month>\d{1,2})月(?<day>\d{1,2})日`,
];

const wDatePatternOptions = [String.raw`(?<year>\d{4})年(?<month>\d{1,2})月(?<day>\d{1,2})`];

const sourcePatternOptions = [String.raw`(.+?)(?:: )?[（(](\d+)(?: |  | )?(?:{{VARIATIONS}})[）)](?: : | |. )?(.+?)?$`];

const profile: LanguageProfileConfig = {
  direction: 'ltr',
  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  sourcePatternOptions,
  normalizers: ['stripBidiControls'],
};

export default profile;
