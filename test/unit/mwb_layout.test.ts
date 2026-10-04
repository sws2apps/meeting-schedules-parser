import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { HTMLParse } from '../../src/common/html_validation.js';
import { parseMWBSchedule } from '../../src/common/html_utils.js';

// Minimal week page modelled on the January–February 2027 Meeting Workbook markup:
// songs are plain <p> paragraphs (no `dc-icon--music` heading), boxes use unclassed <h3>.
const week2027 = ({
  openingSong = '<a href="202027001-extracted.xhtml#pcitation1"><strong>Song 83</strong></a> <strong>and Prayer | Opening Comments</strong> (1 min.)',
  middleSong = '<a href="202027001-extracted.xhtml#pcitation12"><strong>Song 2</strong></a>',
  closingSong = '<a href="202027001-extracted.xhtml#pcitation15"><strong>Song 164</strong></a> <strong>and Prayer</strong>',
  lcExtra = '',
} = {}) => `
<html><body><div class="bodyTxt">
<h1 id="p1">JANUARY 4-10</h1>
<h2 id="p2">EZEKIEL 12-13</h2>
<p id="p3"><span id="pcitationsource1"></span>${openingSong}</p>
<div class="dc-icon--gem"><h2 class="du-fontSize--base du-color--teal-700 du-margin-vertical--0">TREASURES FROM GOD’S WORD</h2></div>
<h3 class="du-fontSize--base du-color--teal-700 du-margin-top--8 du-margin-bottom--0"><strong>1. “Perhaps They Will Take Notice”</strong></h3>
<div><div><p>(10 min.)</p></div><p>Jehovah told Ezekiel to prophesy.</p></div>
<h3 class="du-fontSize--base du-color--teal-700 du-margin-top--8 du-margin-bottom--0"><strong>2. Spiritual Gems</strong></h3>
<div><div><p>(10 min.)</p></div></div>
<h3 class="du-fontSize--base du-color--teal-700 du-margin-top--8 du-margin-bottom--0"><strong>3. Bible Reading</strong></h3>
<div><p>(4 min.) <a href="#citation6">Eze 12:17-28</a> (<a href="202027001-extracted.xhtml#pcitation6"><em>th</em> study 11</a>)</p></div>
<div class="dc-icon--wheat"><h2 class="du-fontSize--base du-color--gold-700 du-margin-vertical--0">APPLY YOURSELF TO THE FIELD MINISTRY</h2></div>
<h3 class="du-fontSize--base du-color--gold-700 du-margin-top--8"><strong>4. Following Up</strong></h3>
<div><p>(3 min.) HOUSE TO HOUSE. Share a truth. (lmd lesson 7 point 4)</p></div>
<h3 class="du-fontSize--base du-color--gold-700 du-margin-top--8"><strong>5. Following Up</strong></h3>
<div><p>(4 min.) INFORMAL WITNESSING. Call back. (lmd lesson 9 point 3)</p></div>
<h3 class="du-fontSize--base du-color--gold-700 du-margin-top--8"><strong>6. What Would You Say?</strong></h3>
<div><div><p>(5 min.) Discussion.</p></div></div>
<div class="dc-icon--sheep"><h2 class="du-fontSize--base du-color--maroon-600 du-margin-vertical--0">LIVING AS CHRISTIANS</h2></div>
<p id="p31"><span id="pcitationsource12"></span>${middleSong}</p>
<h3 class="du-fontSize--base du-color--maroon-600 du-margin-top--8 du-margin-bottom--0"><strong>7. Don’t Forget to Go Back</strong></h3>
<div>
  <div><p>(15 min.) Discussion.</p></div>
  <p><strong>Read</strong> <strong><a href="#citation7">1 Corinthians 3:6</a></strong><strong>.</strong> Then ask the audience:</p>
  ${lcExtra}
</div>
<h3 class="du-fontSize--base du-color--maroon-600 du-margin-top--8 du-margin-bottom--0"><strong>8. Congregation Bible Study</strong></h3>
<div><p>(30 min.) <a href="202027001-extracted.xhtml#pcitation13"><em>gwt</em> book 26 ¶1-6</a></p></div>
<h3 class="du-fontSize--base du-margin-top--8"><strong>Concluding Comments</strong> <span>(3 min.)</span></h3>
<p id="p37"><span id="pcitationsource15"></span>${closingSong}</p>
</div>
<div class="groupExt"><aside><div class="extScrpCite"><p><strong><sup>12</sup></strong> The word of Jehovah came to me.</p></div></aside></div>
</body></html>`;

const parse = (html: string) => parseMWBSchedule(HTMLParse(html), 2027, 'E');

describe('MWB 2027+ layout (songs as paragraphs)', () => {
  it('parses EPUB markup with linked songs', () => {
    const week = parse(week2027());

    expect(week.mwb_week_date).toBe('2027/01/04');
    expect(week.mwb_song_first).toBe(83);
    expect(week.mwb_song_middle).toBe(2);
    expect(week.mwb_song_conclude).toBe(164);

    expect(week.mwb_tgw_talk_title).toBe('1. “Perhaps They Will Take Notice”');
    expect(week.mwb_tgw_bread).toBe('Eze 12:17-28 (th study 11)');
    expect(week.mwb_ayf_count).toBe(3);
    expect(week.mwb_ayf_part3_type).toBe('What Would You Say?');
    expect(week.mwb_lc_count).toBe(1);
    expect(week.mwb_lc_part1_title).toBe('7. Don’t Forget to Go Back');
    expect(week.mwb_lc_cbs).toBe('gwt book 26 ¶1-6');
  });

  it('parses JWPUB markup (jwpub:// links)', () => {
    const week = parse(
      week2027({
        openingSong:
          '<a href="jwpub://p/E:1102016883/"><strong>Song 83</strong></a> <strong>and Prayer | Opening Comments</strong> (1 min.)',
        middleSong: '<a href="jwpub://p/E:1102016802/"><strong>Song 2</strong></a>',
        closingSong: '<a href="jwpub://p/E:1102022964/"><strong>Song 164</strong></a> <strong>and Prayer</strong>',
      }),
    );

    expect([week.mwb_song_first, week.mwb_song_middle, week.mwb_song_conclude]).toEqual([83, 2, 164]);
  });

  it('parses unlinked songs and an unbolded pipe before the opening comments', () => {
    const week = parse(
      week2027({
        openingSong:
          '<a href="jwpub://p/P:1102016883/"><strong>Song 83</strong></a> <strong>and Prayer</strong> | <strong>Opening Comments</strong> (1 min)',
        closingSong: '<strong>Song 164</strong> <strong>and Prayer</strong>',
      }),
    );

    expect([week.mwb_song_first, week.mwb_song_middle, week.mwb_song_conclude]).toEqual([83, 2, 164]);
  });

  it('parses ruby-annotated songs (CJK) separated by zero-width spaces', () => {
    const ruby = (text: string) => `<ruby><rb><strong>${text}</strong></rb></ruby>\u200B`;
    const week = parse(
      week2027({
        closingSong: `${ruby('唱诗')}${ruby('第')}<strong>164\u200B</strong>${ruby('首')}${ruby('和')}${ruby('祷告')}`,
      }),
    );

    expect(week.mwb_song_conclude).toBe(164);
  });

  it('detects songs written with non-ASCII digits (Arabic-Indic) and bidi marks', () => {
    const html = week2027({
      openingSong:
        '<a href="202027001-extracted.xhtml#pcitation1"><strong>الترنيمة ٨٣</strong></a> <strong>وصلاة | تعليقات افتتاحية</strong> (\u200F١ دق)\u200F',
      middleSong: '<a href="202027001-extracted.xhtml#pcitation12"><strong>الترنيمة ٢</strong></a>',
      closingSong:
        '<a href="202027001-extracted.xhtml#pcitation15"><strong>الترنيمة ١٦٤</strong></a> <strong>وصلاة</strong>',
    }).replace(
      '<strong>Concluding Comments</strong> <span>(3 min.)</span>',
      '<strong>تعليقات ختامية</strong> <span>(\u200F٣ دق)\u200F</span>',
    );
    const week = parseMWBSchedule(HTMLParse(html), 2027, 'A');

    expect(String(week.mwb_song_first)).toContain('٨٣');
    expect(String(week.mwb_song_middle)).toContain('٢');
    expect(String(week.mwb_song_conclude)).toContain('١٦٤');
    // non-enhanced language: sources are kept as raw text
    expect(week.mwb_lc_cbs).toBe('8. Congregation Bible Study (30 min.) gwt book 26 ¶1-6');
  });

  it('ignores box headings and bold-led instruction paragraphs inside parts', () => {
    const week = parse(
      week2027({
        lcExtra: `<p><strong>Read</strong> <strong>2 Corinthians 8:2-4.</strong> (study note on 2Co 8:2)</p>
          <hr/><h3><strong>How to Make Effective Return Visits</strong></h3>
          <ul><li><p>Before leaving the initial call, make definite plans to return.</p></li></ul>`,
      }),
    );

    expect(week.mwb_lc_count).toBe(1);
    expect(week.mwb_lc_part1_title).toBe('7. Don’t Forget to Go Back');
    expect(week.mwb_lc_cbs).toBe('gwt book 26 ¶1-6');
    expect(week.mwb_song_conclude).toBe(164);
  });

  it('ignores bold-led instructions placed beside the part headings', () => {
    const html = week2027().replace(
      '<h3 class="du-fontSize--base du-color--maroon-600 du-margin-top--8 du-margin-bottom--0"><strong>8.',
      '<p><strong>Read Galatians 6:4.</strong> Then ask the audience:</p><h3 class="du-fontSize--base du-color--maroon-600 du-margin-top--8 du-margin-bottom--0"><strong>8.',
    );
    const week = parse(html);

    expect(week.mwb_lc_cbs).toBe('gwt book 26 ¶1-6');
    expect(week.mwb_song_conclude).toBe(164);
  });
});

describe('MWB legacy layout (songs as music headings)', () => {
  it('does not treat paragraphs as songs when music headings are present', () => {
    const legacy = week2027()
      .replace(
        /<p id="p3">[\s\S]*?<\/p>/,
        '<h3 class="dc-icon--music du-fontSize--base"><strong>Song 83</strong> <strong>and Prayer | Opening Comments</strong> (1 min.)</h3>',
      )
      .replace(/<p id="p31">[\s\S]*?<\/p>/, '<h3 class="dc-icon--music du-fontSize--base"><strong>Song 2</strong></h3>')
      .replace(
        /<h3 class="du-fontSize--base du-margin-top--8"><strong>Concluding Comments<\/strong>[\s\S]*?<\/p>/,
        '<h3 class="du-fontSize--base du-borderStyle-top--solid"><strong>Concluding Comments</strong> (3 min.) | <strong>Song 164</strong> <strong>and Prayer</strong></h3>',
      )
      // a bold paragraph beside the headings that must NOT be picked up as a song in legacy pages
      .replace(
        '<div class="dc-icon--sheep">',
        '<p><strong>Play the VIDEO Peace at Last! (2022 Convention Song).</strong></p><div class="dc-icon--sheep">',
      );

    const week = parse(legacy);

    expect([week.mwb_song_first, week.mwb_song_middle, week.mwb_song_conclude]).toEqual([83, 2, 164]);
    expect(week.mwb_lc_cbs).toBe('gwt book 26 ¶1-6');
  });
});
