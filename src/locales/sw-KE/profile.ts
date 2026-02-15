import { LanguageProfileConfig } from '../../types/index.js';
import { MONTH_NAME } from '../../constants/index.js';

// Language profile override for sw-KE.

const mwbDatePatternOptions = [String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})`];

const wDatePatternOptions = [
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})[-–](?:\d{1,2})?, (?<year>\d{4})`,
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2})[-–](?:${MONTH_NAME}) (?:\d{1,2}), (?<year>\d{4})`,
  String.raw`(?<month>${MONTH_NAME}) (?<day>\d{1,2}), (?<year>\d{4})`,
];

const sourcePatternOptions = [String.raw`(.+?)(?: )?\((?:{{VARIATIONS}})(?: |  )?(\d+).?\)(?: |.)?(.+?)?$`];

const textOverrides: Record<string, string> = {
  '7. Video ya Machi ya Mambo Yaliyotimizwa na Tengenezo (10 min.) Onyesha VIDEO.':
    '7. Video ya Machi ya Mambo Yaliyotimizwa na Tengenezo (Dak. 10) Onyesha VIDEO.',
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
