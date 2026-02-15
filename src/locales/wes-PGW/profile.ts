import { LanguageProfileConfig } from '../../types/index.js';
import { MONTH_NAME } from '../../constants/index.js';

// Language profile override for wes-PGW.

const mwbDatePatternOptions = [String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})`];

const wDatePatternOptions = [
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})[-–](?:\d{1,2})?, (?<year>\d{4})`,
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})[-–](?:${MONTH_NAME}) (?:\d{1,2}), (?<year>\d{4})`,
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2}), (?<year>\d{4})`,
];

const sourcePatternOptions = [String.raw`(.+?)(?:: )?[（(](\d+)(?: |  )?(?:{{VARIATIONS}})[）)]?(?: : | |. )?(.+?)?$`];

const textOverrides: Record<string, string> = {
  'Fine-Fine Things Wey You See for Bible': 'Fine-Fine Things Wey You See for Bible: (10 min.)',
};

const profile: LanguageProfileConfig = {
  direction: 'ltr',
  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),
  sourcePatternOptions,
  normalizers: ['stripBidiControls'],
  textOverrides,
};

export default profile;
