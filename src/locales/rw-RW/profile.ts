import { LanguageProfileConfig } from '../../types/index.js';
import { MONTH_NAME } from '../../constants/index.js';

// Language profile override for rw-RW.

const mwbDatePatternOptions = [
  String.raw`\b(?<day>\d{1,2})[-](?:\d{1,2}) (?<month>${MONTH_NAME})`,
  String.raw`\b(?<day>\d{1,2}) (?<month>${MONTH_NAME})`,
];

const wDatePatternOptions = [
  String.raw`\b(?<day>\d{1,2})[-](?:\d{1,2})? (?<month>${MONTH_NAME}) (?<year>\d{4})`,
  String.raw`\b(?<day>\d{1,2}) (?<month>${MONTH_NAME})[-](?:\d{1,2}) (?:${MONTH_NAME}) (?<year>\d{4})`,
  String.raw`\b(?<day>\d{1,2}) (?<month>${MONTH_NAME}) (?<year>\d{4})`,
];

const sourcePatternOptions = [String.raw`(.+?)(?: )?\((?:{{VARIATIONS}})(?: |  )?(\d+).?\)(?: |.)?(.+?)?$`];

const textOverrides: Record<string, string> = {
  '4. Gutangiza ikiganiro (Umun. 1) KUBWIRIZA KU NZU N’INZU. Umubwiriza asange umuntu avuga urundi rurimi. (lmd isomo rya 2 ingingo ya 5)':
    '4. Gutangiza ikiganiro (Imin. 1) KUBWIRIZA KU NZU N’INZU. Umubwiriza asange umuntu avuga urundi rurimi. (lmd isomo rya 2 ingingo ya 5)',
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
