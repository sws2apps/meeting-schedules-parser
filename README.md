# Meeting Schedules Parser

[![CI](https://github.com/sws2apps/jw-epub-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/sws2apps/jw-epub-parser/actions/workflows/ci.yml)
[![CD](https://github.com/sws2apps/jw-epub-parser/actions/workflows/deploy.yml/badge.svg)](https://github.com/sws2apps/jw-epub-parser/actions/workflows/deploy.yml)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![jw-epub-parser](https://snyk.io/advisor/npm-package/jw-epub-parser/badge.svg)](https://snyk.io/advisor/npm-package/jw-epub-parser)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sws2apps_jw-epub-parser&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sws2apps_jw-epub-parser)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=sws2apps_jw-epub-parser&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=sws2apps_jw-epub-parser)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=sws2apps_jw-epub-parser&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=sws2apps_jw-epub-parser)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=sws2apps_jw-epub-parser&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=sws2apps_jw-epub-parser)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=sws2apps_jw-epub-parser&metric=bugs)](https://sonarcloud.io/summary/new_code?id=sws2apps_jw-epub-parser)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=sws2apps_jw-epub-parser&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=sws2apps_jw-epub-parser)

#### A parser utility to extract the needed meeting schedules from Meeting Workbook and Watchtower Study JWPUB and EPUB files.

## Install

```bash
npm i meeting-schedules-parser
```

## Usage

```js
// browser
import { loadEPUB } from 'meeting-schedules-parser';

// node esm
import { loadEPUB } from 'meeting-schedules-parser/dist/node/index.js';

// node commonjs
const { loadEPUB } = require('meeting-schedules-parser/dist/node/index.cjs');

// sample usage
const epubJW = await loadEPUB('/path/to/file.epub');

const epubJW = await loadEPUB({ url: epubUrl });
```

### loadEPUB(epubData)

function: asynchronous

#### epubData

type: `string` or `blob` or `url`

It can be the path to the EPUB file or EPUB file's blob or url to download the EPUB file.

## Return

By calling the `loadEPUB` function, it will return an array of objects with the following properties:

#### Meeting Workbook Data

| Name                     |       Type        | Description                                                                                                                     |
| ------------------------ | :---------------: | ------------------------------------------------------------------------------------------------------------------------------- |
| mwb_week_date            |      string       | Week date. For enhanced parsing, it is formatted as `yyyy/mm/dd`                                                                |
| mwb_week_date_locale\*   |      string       | Week date                                                                                                                       |
| mwb_weekly_bible_reading |      string       | Weekly Bible Reading                                                                                                            |
| mwb_song_first           |      integer      | First song                                                                                                                      |
| mwb_tgw_talk             |      string       | 10 min talk title of the Treasures from God’s Word                                                                              |
| mwb_tgw_talk_title\*     |      string       | 10 min talk full title of the Treasures from God’s Word                                                                         |
| mwb_tgw_gems_title       |      string       | Spiritual gems full title of the Treasures from God’s Word                                                                      |
| mwb_tgw_bread            |      string       | Bible Reading for student                                                                                                       |
| mwb_tgw_bread_title\*    |      string       | Bible Reading assignment full title for student                                                                                 |
| mwb_ayf_count            |      integer      | Number of parts in Apply Yourself to the Field Ministry                                                                         |
| mwb_ayf_part1            |      string       | Part 1 in Apply Yourself to the Field Ministry                                                                                  |
| mwb_ayf_part1_time\*     |      integer      | Timing of Part 1 in Apply Yourself to the Field Ministry                                                                        |
| mwb_ayf_part1_type\*     |      string       | Type of Part 1 in Apply Yourself to the Field Ministry                                                                          |
| mwb_ayf_part1_title\*    |      string       | Assignment full title of Part 1 in Apply Yourself to the Field Ministry                                                         |
| mwb_ayf_part2            |      string       | Part 2 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is 1                     |
| mwb_ayf_part2_time\*     |      integer      | Timing of Part 2 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is 1           |
| mwb_ayf_part2_type\*     |      string       | Type of Part 2 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is 1             |
| mwb_ayf_part2_title\*    |      string       | Assignment full title of Part 2 in Apply Yourself to the Field Ministry                                                         |
| mwb_ayf_part3            |      string       | Part 3 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is less than 3           |
| mwb_ayf_part3_time\*     |      integer      | Timing of Part 3 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is less than 3 |
| mwb_ayf_part3_type\*     |      string       | Type of Part 3 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is less than 3   |
| mwb_ayf_part3_title\*    |      string       | Assignment full title of Part 3 in Apply Yourself to the Field Ministry                                                         |
| mwb_ayf_part4            |      string       | Part 4 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is less than 4           |
| mwb_ayf_part4_time\*     |      integer      | Timing of Part 4 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is less than 4 |
| mwb_ayf_part4_type\*     |      string       | Type of Part 4 in Apply Yourself to the Field Ministry. This property will not be available if `mwb_ayf_count` is less than 4   |
| mwb_ayf_part4_title\*    |      string       | Assignment full title of Part 4 in Apply Yourself to the Field Ministry                                                         |
| mwb_song_middle          |      integer      | Middle song                                                                                                                     |
| mwb_lc_count             |      integer      | Number of parts in Living as Christians                                                                                         |
| mwb_lc_part1             |      string       | Part 1 in Living as Christians                                                                                                  |
| mwb_lc_part1_time\*      |      integer      | Timing of Part 1 in Living as Christians                                                                                        |
| mwb_lc_part1_content\*   |      string       | Content of Part 1 in Living as Christians                                                                                       |
| mwb_lc_part1_title\*     |      string       | Full title of Part 1 in Living as Christians                                                                                    |
| mwb_lc_part2             |      string       | Part 2 in Living as Christians. This property will not be available if `mwb_lc_count` is 1                                      |
| mwb_lc_part2_time\*      |      integer      | Timing of Part 2 in Living as Christians. This property will not be available if `mwb_lc_count` is 1                            |
| mwb_lc_part2_content\*   |      string       | Content of Part 2 in Living as Christians. This property will not be available if `mwb_lc_count` is 1                           |
| mwb_lc_part2_title\*     |      string       | Full title of Part 2 in Living as Christians                                                                                    |
| mwb_lc_cbs               |      string       | Congregation Bible Study source material                                                                                        |
| mwb_lc_cbs_title\*       |      string       | Congregation Bible Study assignment full title                                                                                  |
| mwb_song_conclude        | integer or string | Concluding song. When the song number is out of range, it will be the default text from the Meeting Workbook.                   |

#### Watchtowet Study Data

| Name                    |  Type   | Description                                                      |
| ----------------------- | :-----: | ---------------------------------------------------------------- |
| w_study_date            | string  | Week date. For enhanced parsing, it is formatted as `yyyy/mm/dd` |
| w_study_date_locale\*   | string  | Week date                                                        |
| w_study_title           | string  | Watchtower Study Article Title                                   |
| w_study_opening_song    | integer | Opening Song for the Watchtower Study                            |
| w_study_concluding_song | integer | Concluding Song for the Watchtower Study                         |

\* These properties are only available when enhanced parsing is available for the language you parse.

Currently, we only support enhanced parsing for the following languages:

```bash
Chinese Mandarin (Simplified), Chinese Mandarin (Traditional)
Dutch
English
French
German
Haitian Creole
Iloko, Italian
Japanese
Kinyarwanda, Korean
Liberian English
Malagasy, Malay
Pidgin (West Africa), Polish, Portuguese Brazil
Romanian, Russian
Slovenian, Spanish, Swahili, Swedish
Tagalog, Tandroy, Tankarana, Turkish, Twin
Ukrainian
Vietnamese, Vezo
```

For the other languages, you may use your own method to convert these outputs according to your needs to get the needed informations. If you want to contribute and add your language in the enhanced parsing list, or edit your language rules, please follow [this guide](./TRANSLATION.md).

## Sample Output

Here are how the results of this module look like:

### With enhanced parsing

#### Meeting Workbook Data

```js
[
  {
    mwb_week_date: '2024/11/04',
    mwb_week_date_locale: 'NOVEMBER 4-10',
    mwb_weekly_bible_reading: 'PSALM 105',
    mwb_song_first: 3,
    mwb_tgw_talk: '“He Remembers His Covenant Forever”',
    mwb_tgw_talk_title: '1. “He Remembers His Covenant Forever”',
    mwb_tgw_gems_title: '2. Spiritual Gems',
    mwb_tgw_bread: 'Ps 105:24-45 (th study 5)',
    mwb_tgw_bread_title: '3. Bible Reading',
    mwb_ayf_count: 4,
    mwb_ayf_part1: 'HOUSE TO HOUSE. The householder is busy. (lmd lesson 2 point 5)',
    mwb_ayf_part1_time: 1,
    mwb_ayf_part1_type: 'Starting a Conversation',
    mwb_ayf_part1_title: '4. Starting a Conversation',
    mwb_ayf_part2: 'HOUSE TO HOUSE. End the conversation on a positive note when the person begins to argue. (lmd lesson 4 point 5)',
    mwb_ayf_part2_time: 2,
    mwb_ayf_part2_type: 'Starting a Conversation',
    mwb_ayf_part2_title: '5. Starting a Conversation',
    mwb_ayf_part3: 'HOUSE TO HOUSE. Offer a magazine on a topic that the person previously showed interest in. (lmd lesson 8 point 3)',
    mwb_ayf_part3_time: 4,
    mwb_ayf_part3_type: 'Following Up',
    mwb_ayf_part3_title: '6. Following Up',
    mwb_ayf_part4: 'INFORMAL WITNESSING. Tell the person about the JW Library® app, and help him download it. (lmd lesson 9 point 5)',
    mwb_ayf_part4_time: 4,
    mwb_ayf_part4_type: 'Following Up',
    mwb_ayf_part4_title: '7. Following Up',
    mwb_song_middle: 84,
    mwb_lc_count: 1,
    mwb_lc_part1: 'Expressions of Your Love',
    mwb_lc_part1_time: 15,
    mwb_lc_part1_title: '8. Expressions of Your Love',
    mwb_lc_part1_content: 'Discussion.',
    mwb_lc_cbs: 'bt chap. 17 ¶13-19',
    mwb_lc_cbs_title: '9. Congregation Bible Study',
    mwb_song_conclude: 97,
  },
	...
]
```

#### Watchtower Study Data

```js
[
  {
    w_study_date: '2025/01/06',
	  w_study_date_locale: 'Study Article 44: January 6-12, 2025',
	  w_study_title: 'How to Cope With Injustice',
	  w_study_opening_song: 33,
	  w_study_concluding_song: 38
  },
	...
]
```

### Without enhanced parsing

#### Meeting Workbook Data

```js
[
  {
    mwb_week_date: '4.-10. NOVEMBER',
    mwb_weekly_bible_reading: 'SALME 105',
    mwb_song_first: 3,
    mwb_tgw_talk: '1. “Han husker for evigt sin pagt” (10 min.)',
    mwb_tgw_gems_title: '2. Åndelige perler (10 min.)',
    mwb_tgw_bread: '3. Oplæsning fra Bibelen (4 min.) Sl 105:24-45 (th arbejdspunkt 5)',
    mwb_ayf_count: 4,
    mwb_ayf_part1: '4. Start en samtale (1 min.) FRA HUS TIL HUS. Den besøgte har travlt. (lmd lektion 2 punkt 5)',
    mwb_ayf_part2: '5. Start en samtale (2 min.) FRA HUS TIL HUS. Du afslutter samtalen på en venlig måde da den besøgte vil diskutere. (lmd lektion 4 punkt 5)',
    mwb_ayf_part3: '6. Følg op på interessen (4 min.) FRA HUS TIL HUS. Tilbyd et blad om noget som den besøgte tidligere har udtrykt interesse for. (lmd lektion 8 punkt 3)',
    mwb_ayf_part4: '7. Følg op på interessen (4 min.) UFORMEL FORKYNDELSE. Fortæl personen om JW Library®-appen, og hjælp ham eller hende med at downloade den. (lmd lektion 9 punkt 5)',
    mwb_song_middle: 84,
    mwb_lc_count: 1,
    mwb_lc_part1: '8. Hvordan vi kan vise vores kærlighed (15 min.) Drøftelse.',
    mwb_lc_cbs: '9. Menighedsbibelstudiet (30 min.) bt kap. 17 § 13-19',
    mwb_song_conclude: 97,
  },
	...
]
```

#### Watchtower Study Data

```js
[
  {
    w_study_date: 'Studieartikel 44, 6.-12. januar 2025',
    w_study_title: 'Hvordan du kan tackle uretfærdighed',
    w_study_opening_song: 33,
    w_study_concluding_song: 38
  },
	...
]
```
