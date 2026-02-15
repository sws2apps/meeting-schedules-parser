#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const NODE_UTILS_PATH = path.join(ROOT, 'src/node/utils.node.ts');
const BROWSER_UTILS_PATH = path.join(ROOT, 'src/browser/utils.browser.ts');
const ENHANCED_LANGUAGES_PATH = path.join(ROOT, 'src/config/enhanced_languages.ts');
const LANGUAGE_PROFILE_OVERRIDES_INDEX_PATH = path.join(ROOT, 'src/config/language_profile_overrides.ts');
const LOCALES_DIR = path.join(ROOT, 'src/locales');

const REQUIRED_LOCALE_KEYS = [
  'januaryVariations',
  'februaryVariations',
  'marchVariations',
  'aprilVariations',
  'mayVariations',
  'juneVariations',
  'julyVariations',
  'augustVariations',
  'septemberVariations',
  'octoberVariations',
  'novemberVariations',
  'decemberVariations',
  'partMinutesSeparatorVariations',
];

const usage = () => {
  console.log(`
Usage:
  node scripts/locale-manager.js check
  node scripts/locale-manager.js new --code <CODE> --locale <locale> [--enhanced true|false]
`);
};

const parseArgs = (argv) => {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key.startsWith('--')) {
      args[key.slice(2)] = value;
      i++;
    }
  }

  return args;
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const readFile = async (filePath) => fs.readFile(filePath, 'utf8');

const parseLocaleImports = (content, isNodeFile) => {
  const regex = isNodeFile
    ? /import\s+([A-Z0-9]+)\s+from '\.\.\/locales\/([^/]+)\/text\.json' with \{ type: 'json' \};/g
    : /import\s+([A-Z0-9]+)\s+from '\.\.\/locales\/([^/]+)\/text\.json';/g;
  const records = [];
  let match;

  while ((match = regex.exec(content))) {
    records.push({ code: match[1], locale: match[2] });
  }

  return records;
};

const parseLanguagesObjectCodes = (content) => {
  const blockMatch = content.match(/languages:\s*\{([\s\S]*?)\n\s*\},\n\s*(?:path|loadSQL|readFile)/);

  if (!blockMatch) {
    return [];
  }

  return Array.from(blockMatch[1].matchAll(/^\s*([A-Z0-9]+),\s*$/gm)).map((m) => m[1]);
};

const parseEnhancedEntries = (content) => {
  const regex = /\{\s*locale:\s*'([^']+)',\s*code:\s*'([A-Z0-9]+)'\s*\}/g;
  const records = [];
  let match;

  while ((match = regex.exec(content))) {
    records.push({ locale: match[1], code: match[2] });
  }

  return records;
};

const parseProfileOverrideImports = (content) => {
  const regex = /import\s+([A-Z0-9]+)\s+from '\.\.\/locales\/([^/]+)\/profile\.js';/g;
  const records = [];
  let match;

  while ((match = regex.exec(content))) {
    records.push({ code: match[1], locale: match[2] });
  }

  return records;
};

const parseProfileOverrideMapEntries = (content) => {
  const match = content.match(/languageStrategyOverrides:\s*[^\{]*\{([\s\S]*?)\n\};/);
  if (!match) {
    return [];
  }

  return Array.from(match[1].matchAll(/^\s*([A-Z0-9]+),\s*$/gm)).map((m) => m[1]);
};

const validateCode = (code) => /^[A-Z0-9]{1,4}$/.test(code);
const validateLocale = (locale) => /^[A-Za-z0-9-]+$/.test(locale);

const insertNodeImport = (content, code, locale) => {
  const importLine = `import ${code} from '../locales/${locale}/text.json' with { type: 'json' };`;

  if (content.includes(importLine)) {
    return content;
  }

  const lines = content.split('\n');
  const idx = lines.findIndex((line, i) => i > 0 && line.startsWith("import Z from '../locales/"));
  const insertAt = idx === -1 ? lines.findIndex((line) => line.startsWith('declare global')) : idx + 1;
  lines.splice(insertAt, 0, importLine);

  return lines.join('\n');
};

const insertBrowserImport = (content, code, locale) => {
  const importLine = `import ${code} from '../locales/${locale}/text.json';`;

  if (content.includes(importLine)) {
    return content;
  }

  const lines = content.split('\n');
  const idx = lines.findIndex((line, i) => i > 0 && line.startsWith("import Z from '../locales/"));
  const insertAt = idx === -1 ? lines.findIndex((line) => line.startsWith('declare global')) : idx + 1;
  lines.splice(insertAt, 0, importLine);

  return lines.join('\n');
};

const insertCodeInLanguagesObject = (content, code) => {
  const hasCode = new RegExp(`^\s*${code},\s*$`, 'm').test(content);
  if (hasCode) {
    return content;
  }

  return content.replace(/(\s*Z,\n)(\s*\},\n\s*(?:path|loadSQL|readFile))/m, `$1    ${code},\n$2`);
};

const addEnhancedLanguageEntry = (content, code, locale) => {
  const entries = parseEnhancedEntries(content);
  const hasCode = entries.some((entry) => entry.code === code);

  const nextEntries = hasCode ? entries : [...entries, { locale, code }];
  nextEntries.sort((a, b) => a.code.localeCompare(b.code));

  const lines = [];
  lines.push('export default [');
  for (const entry of nextEntries) {
    lines.push(`  { locale: '${entry.locale}', code: '${entry.code}' },`);
  }
  lines.push('];');
  lines.push('');

  return lines.join('\n');
};

const buildLanguageProfileOverridesIndex = (entries) => {
  const byCode = {};
  for (const entry of entries) {
    byCode[entry.code] = entry.locale;
  }
  const sortedCodes = Object.keys(byCode).sort();

  const lines = [];
  lines.push("import { LanguageStrategyOverridesMap } from '../types/index.js';");
  for (const code of sortedCodes) {
    lines.push(`import ${code} from '../locales/${byCode[code]}/profile.js';`);
  }
  lines.push('');
  lines.push('export const languageStrategyOverrides: LanguageStrategyOverridesMap = {');
  for (const code of sortedCodes) {
    lines.push(`  ${code},`);
  }
  lines.push('};');
  lines.push('');

  return lines.join('\n');
};

const check = async () => {
  const [nodeContent, browserContent, enhancedContent, profileOverridesIndexContent] = await Promise.all([
    readFile(NODE_UTILS_PATH),
    readFile(BROWSER_UTILS_PATH),
    readFile(ENHANCED_LANGUAGES_PATH),
    readFile(LANGUAGE_PROFILE_OVERRIDES_INDEX_PATH),
  ]);

  const nodeImports = parseLocaleImports(nodeContent, true);
  const browserImports = parseLocaleImports(browserContent, false);
  const nodeCodes = parseLanguagesObjectCodes(nodeContent);
  const browserCodes = parseLanguagesObjectCodes(browserContent);
  const enhancedEntries = parseEnhancedEntries(enhancedContent);
  const profileOverrideImports = parseProfileOverrideImports(profileOverridesIndexContent);
  const profileOverrideEntries = parseProfileOverrideMapEntries(profileOverridesIndexContent);

  const errors = [];

  const nodeImportCodes = new Set(nodeImports.map((r) => r.code));
  const browserImportCodes = new Set(browserImports.map((r) => r.code));
  const nodeObjectCodes = new Set(nodeCodes);
  const browserObjectCodes = new Set(browserCodes);
  const profileImportCodes = new Set(profileOverrideImports.map((r) => r.code));
  const profileMapCodes = new Set(profileOverrideEntries);

  for (const code of nodeImportCodes) {
    if (!browserImportCodes.has(code)) {
      errors.push(`Code ${code} exists in node locale imports but not in browser locale imports.`);
    }
  }

  for (const code of browserImportCodes) {
    if (!nodeImportCodes.has(code)) {
      errors.push(`Code ${code} exists in browser locale imports but not in node locale imports.`);
    }
  }

  for (const code of nodeImportCodes) {
    if (!nodeObjectCodes.has(code)) {
      errors.push(`Code ${code} exists in node imports but is missing in node languages object.`);
    }
  }

  for (const code of browserImportCodes) {
    if (!browserObjectCodes.has(code)) {
      errors.push(`Code ${code} exists in browser imports but is missing in browser languages object.`);
    }
  }

  for (const entry of enhancedEntries) {
    if (!nodeImportCodes.has(entry.code)) {
      errors.push(`Enhanced code ${entry.code} is not loaded in node/browser locale maps.`);
    }

    const localeFile = path.join(LOCALES_DIR, entry.locale, 'text.json');
    if (!(await fileExists(localeFile))) {
      errors.push(`Enhanced locale file is missing: src/locales/${entry.locale}/text.json`);
    }

    if (!profileImportCodes.has(entry.code)) {
      errors.push(`Enhanced code ${entry.code} is missing from language profile imports (src/config/language_profile_overrides.ts).`);
    }

    if (!profileMapCodes.has(entry.code)) {
      errors.push(`Enhanced code ${entry.code} is missing from language profile override map (src/config/language_profile_overrides.ts).`);
    }

    const profileOverrideFile = path.join(LOCALES_DIR, entry.locale, 'profile.ts');
    if (!(await fileExists(profileOverrideFile))) {
      errors.push(`Missing language profile override file: src/locales/${entry.locale}/profile.ts`);
    }
  }

  for (const { locale, code } of nodeImports) {
    const localeFile = path.join(LOCALES_DIR, locale, 'text.json');

    if (!(await fileExists(localeFile))) {
      errors.push(`Locale import ${code} points to missing file: src/locales/${locale}/text.json`);
      continue;
    }

    const json = JSON.parse(await readFile(localeFile));
    for (const key of REQUIRED_LOCALE_KEYS) {
      if (!(key in json)) {
        errors.push(`Locale ${locale} (${code}) is missing required key "${key}" in text.json.`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('Locale consistency check failed:\n');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log('Locale consistency check passed.');
};

const createLocale = async (args) => {
  const code = args.code?.toUpperCase();
  const locale = args.locale;
  const enhanced = (args.enhanced ?? 'true').toLowerCase() === 'true';

  if (!code || !locale) {
    usage();
    process.exit(1);
  }

  if (!validateCode(code)) {
    console.error('Invalid --code. Use uppercase letters/digits, length 1-4. Example: Q, BL, TPO.');
    process.exit(1);
  }

  if (!validateLocale(locale)) {
    console.error('Invalid --locale. Example: he-IL, en, pt-POR.');
    process.exit(1);
  }

  const [nodeContentRaw, browserContentRaw, enhancedContentRaw] = await Promise.all([
    readFile(NODE_UTILS_PATH),
    readFile(BROWSER_UTILS_PATH),
    readFile(ENHANCED_LANGUAGES_PATH),
  ]);

  const localeFile = path.join(LOCALES_DIR, locale, 'text.json');
  if (!(await fileExists(localeFile))) {
    console.error(`Missing locale file: src/locales/${locale}/text.json`);
    console.error('This file is Crowdin-synced and must exist before running locale:new.');
    console.error('Sync/add the locale via Crowdin first, then re-run this command.');
    process.exit(1);
  }

  const localeJson = JSON.parse(await readFile(localeFile));
  for (const key of REQUIRED_LOCALE_KEYS) {
    if (!(key in localeJson)) {
      console.error(`Locale file src/locales/${locale}/text.json is missing required key "${key}".`);
      process.exit(1);
    }
  }

  const nextNodeContent = insertCodeInLanguagesObject(insertNodeImport(nodeContentRaw, code, locale), code);
  const profileEntries = parseLocaleImports(nextNodeContent, true).map((record) => ({
    code: record.code,
    locale: record.locale,
  }));
  const profileOverridesIndex = buildLanguageProfileOverridesIndex(profileEntries);
  let nodeContent = nextNodeContent;

  let browserContent = insertBrowserImport(browserContentRaw, code, locale);
  browserContent = insertCodeInLanguagesObject(browserContent, code);

  let enhancedContent = enhancedContentRaw;
  if (enhanced) {
    enhancedContent = addEnhancedLanguageEntry(enhancedContentRaw, code, locale);
  }

  const profileOverridePath = path.join(LOCALES_DIR, locale, 'profile.ts');
  if (!(await fileExists(profileOverridePath))) {
    await fs.writeFile(
      profileOverridePath,
      [
        "import { LanguageProfileConfig } from '../../types/index.js';",
        "import { MONTH_NAME } from '../../constants/index.js';",
        '',
        `// Language profile override for ${code}.`,
        '',
        'const mwbDatePatternOptions = [',
        '  String.raw`\\\\b(?<day>\\\\d{1,2})[-](?:\\\\d{1,2}) (?<month>${MONTH_NAME})`,',
        '  String.raw`\\\\b(?<day>\\\\d{1,2}) (?<month>${MONTH_NAME})`,',
        '];',
        '',
        'const wDatePatternOptions = [',
        '  String.raw`\\\\b(?<day>\\\\d{1,2})[-](?:\\\\d{1,2})? (?<month>${MONTH_NAME}) (?<year>\\\\d{4})`,',
        '  String.raw`\\\\b(?<day>\\\\d{1,2}) (?<month>${MONTH_NAME})[-](?:\\\\d{1,2}) (?:${MONTH_NAME}) (?<year>\\\\d{4})`,',
        '  String.raw`\\\\b(?<day>\\\\d{1,2}) (?<month>${MONTH_NAME})(?:,)? (?<year>\\\\d{4})`,',
        '];',
        '',
        'const sourcePatternOptions = [String.raw`(.+?)(?:: )?[（(](\\\\d+)(?: |  | )?(?:{{VARIATIONS}})[）)](?: : | |. )?(.+?)?$`];',
        '',
        'const textOverrides: Record<string, string> = {};',
        '',
        'const profile: LanguageProfileConfig = {',
        "  direction: 'ltr',",
        "  mwbDatePatterns: mwbDatePatternOptions.map((option) => new RegExp(option, 'giu')),",
        "  wDatePatterns: wDatePatternOptions.map((option) => new RegExp(option, 'giu')),",
        '  sourcePatternOptions,',
        "  normalizers: ['stripBidiControls'],",
        '  textOverrides,',
        '};',
        '',
        'export default profile;',
        '',
      ].join('\n'),
      'utf8'
    );
  }

  await Promise.all([
    fs.writeFile(LANGUAGE_PROFILE_OVERRIDES_INDEX_PATH, profileOverridesIndex, 'utf8'),
    fs.writeFile(NODE_UTILS_PATH, nodeContent, 'utf8'),
    fs.writeFile(BROWSER_UTILS_PATH, browserContent, 'utf8'),
    fs.writeFile(ENHANCED_LANGUAGES_PATH, enhancedContent, 'utf8'),
  ]);

  console.log(`Locale scaffolding completed for ${code} (${locale}).`);
  console.log(`- Verified Crowdin locale file: src/locales/${locale}/text.json`);
  console.log(`- Updated: src/config/language_profile_overrides.ts`);
  console.log(`- Ensured: src/locales/${locale}/profile.ts`);
  console.log('- Updated: src/node/utils.node.ts');
  console.log('- Updated: src/browser/utils.browser.ts');
  if (enhanced) {
    console.log('- Updated: src/config/enhanced_languages.ts');
  } else {
    console.log('- Skipped enhanced language registry update (--enhanced false).');
  }
  console.log('\nNext steps:');
  console.log('1. Fill locale text in src/locales/<locale>/text.json (or via Crowdin sync).');
  console.log('2. If needed, add/update locale-specific parsing options directly in src/locales/<locale>/profile.ts.');
  console.log('3. Run: npm run locale:check && npm run build && npm test');
};

const main = async () => {
  const command = process.argv[2];
  const args = parseArgs(process.argv.slice(3));

  if (!command || command === '--help' || command === '-h') {
    usage();
    return;
  }

  if (command === 'check') {
    await check();
    return;
  }

  if (command === 'new') {
    await createLocale(args);
    return;
  }

  usage();
  process.exit(1);
};

await main();
