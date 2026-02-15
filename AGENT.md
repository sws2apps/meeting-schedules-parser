# AGENT.md

## Purpose
`meeting-schedules-parser` parses JW Meeting Workbook (`mwb_*`) and Watchtower Study (`w_*`) publications from `.jwpub` and `.epub` files and returns normalized schedule objects.

Primary public API:
- `loadPub(...)` from:
  - Browser: `meeting-schedules-parser`
  - Node ESM: `meeting-schedules-parser/dist/node/index.js`
  - Node CJS: `meeting-schedules-parser/dist/node/index.cjs`

## High-Level Architecture
- Entry points:
  - `src/node/index.ts`
  - `src/browser/index.ts`
- Shared parser orchestrator:
  - `src/common/parser.ts`
- Input/file validation:
  - `src/common/file_validation.ts`
- Format-specific parsing:
  - EPUB: `src/common/epub_parser.ts`
  - JWPUB (DB + decrypt): `src/common/jwpub_parser.ts`
- HTML extraction + schedule shaping:
  - `src/common/html_utils.ts`
  - `src/common/html_validation.ts`
- Enhanced language-aware parsing:
  - `src/common/date_parser.ts`
  - `src/common/parsing_rules.ts`
  - `src/common/source_strategies.ts`
  - `src/common/language_rules.ts`
- Enhanced-language config:
  - `src/config/enhanced_languages.ts`
  - `src/config/language_profile_overrides.ts`
- Locale data:
  - Crowdin translation file: `src/locales/*/text.json`
  - Parser profile: `src/locales/*/profile.ts`

## Runtime Model
The code relies on a global `meeting_schedules_parser` object, initialized by:
- Node: `src/node/utils.node.ts`
- Browser: `src/browser/utils.browser.ts`

This global provides:
- locale rules (`languages`)
- path helpers (`path`)
- file IO in Node (`readFile`)
- SQL.js loader (`loadSQL`)

If parsing code is used without these initializers, it will fail.

## Parsing Flow
1. `loadPub` validates input.
2. `startParse` enforces filename rules and issue minimums:
   - MWB >= `202401`
   - W >= `202310`
3. Publication bytes are loaded (file path, Blob, or URL).
4. Zip safety checks run (`max files`, `max total size`, path traversal).
5. Branch by extension:
   - `.epub` -> XHTML scan and parse.
   - `.jwpub` -> decrypt DB documents and parse HTML payloads.
6. Schedules are assembled in `html_utils.ts`.
7. If language is in enhanced list (`src/config/enhanced_languages.ts`), date/source parts are normalized into structured fields using locale profile config.

## Output Contracts
Types are in `src/types/index.ts`:
- `MWBSchedule`
- `WSchedule`

Enhanced fields are optional and language-dependent (for example locale date vs normalized date).

## Important Invariants
- File naming is strict (`mwb_[A-Z]{1,3}_YYYYMM.*` / `w_[A-Z]{1,3}_YYYYMM.*`).
- JWPUB is expected to contain exactly 2 top-level files in zip.
- Locale text comes from Crowdin-managed JSON files.
- Locale parser behavior is defined in per-locale `profile.ts` and wired through `src/config/language_profile_overrides.ts`.
- Enhanced parsing logic is regex-driven and sensitive to punctuation/spacing changes; keep changes narrowly scoped and fixture-backed.

## Build and Test
Common commands:
- `npm run build`
- `npm test`
- `npm run parse`
- `npm run locale:check`
- `npm run locale:new -- --code <CODE> --locale <locale> [--enhanced true|false]`
- `npm run cypress:open`
- `npm run cypress:run`

Notes:
- `test/01_standardParsing.test.js` and `test/02_enhancedParsing.test.js` are integration-style and pull data from JW CDN.
- Tests compare parser output with fixtures in `test/fixtures`.
- Tests import from `dist/node/index.js`, so build first when changing source.

## Change Guidelines
- Do not edit `dist/*` manually.
- Prefer edits in `src/common/*` for parser behavior.
- When adding/updating enhanced parsing for a language:
  1. Ensure language code exists in globals (`utils.node.ts` and `utils.browser.ts`) and `src/config/enhanced_languages.ts`.
  2. Sync/update locale tokens in `src/locales/<locale>/text.json` (Crowdin-managed).
  3. Add/update `src/locales/<locale>/profile.ts`.
  4. Validate with `npm run locale:check`, `npm run build`, and `npm test`.
- Prefer per-locale `textOverrides` in profile for one-off content fixes; use parser regex updates for recurring structural patterns.
- Keep parser errors descriptive with source input context (`JWEPUBParserError` usage).

## Known Sensitive Areas
- `src/common/parsing_rules.ts`: assignment parsing by regex (including RTL/bidi normalization work).
- `src/common/date_parser.ts`: strategy dispatch and date extraction flow.
- `src/common/source_strategies.ts`: regex assembly, bidi stripping, and numeral normalization helpers.
- `src/common/html_utils.ts`: DOM selector assumptions for multiple publication layouts.
- `src/common/jwpub_parser.ts`: decryption/DB extraction path.

## Client Demo
- Demo app is under `client/`.
- Browser setup requires copied wasm (`copy-wasm.js`) and bundler external config for Node built-ins.
