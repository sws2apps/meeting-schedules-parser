import JSZip from 'jszip';
import { HTMLElement } from 'node-html-parser';
import languages from '../locales/languages.js';

import { extractSongNumber, extractSourceEnhanced } from './parsing_rules.js';
import { MWBSchedule, WSchedule } from '../types/index.js';
import { extractMWBDate, extractWTStudyDate } from './date_parser.js';
import { getHTMLString, HTMLParse, isValidHTML, isValidMWBSchedule, isValidWSchedule } from './html_validation.js';

export const getMWBWeekDate = (htmlItem: HTMLElement) => {
  const wdHtml = htmlItem.querySelector('h1')!;
  const weekDate = wdHtml.textContent.replace(/\u00A0/g, ' ');

  return weekDate;
};

export const getMWBWeeklyBibleReading = (htmlItem: HTMLElement) => {
  const wbHtml = htmlItem.querySelector('h2')!;
  const weeklyBibleReading = wbHtml.textContent.replace(/\u00A0/g, ' ');

  return weeklyBibleReading;
};

export const getMWBAYFCount = (htmlItem: HTMLElement) => {
  let count: number = 1;

  const testSection = htmlItem.querySelector('#section3');

  //  pre-2024 mwb
  if (testSection) {
    count = testSection.querySelectorAll('li').length;
  }

  // 2024 onward
  if (!testSection) {
    count = htmlItem.querySelectorAll('.du-color--gold-700').length - 1;
  }

  return count;
};

export const getMWBLCCount = (htmlItem: HTMLElement) => {
  let count = 1;

  const testSection = htmlItem.querySelector('#section4');

  //  pre-2024 mwb
  if (testSection) {
    count = testSection.querySelectorAll('li').length;
    count = count === 6 ? 2 : 1;
  }

  // 2024 onward
  if (testSection === null) {
    count = htmlItem.querySelectorAll('.du-color--maroon-600.du-margin-top--8.du-margin-bottom--0').length - 1;
  }

  return count;
};

export const getMWBSources = (htmlItem: HTMLElement) => {
  let src = '';

  // pre-2024 mwb
  // get elements with meeting schedule data: pGroup
  const pGroupData = htmlItem.querySelectorAll('.pGroup');
  for (const pGroup of pGroupData) {
    const liData = pGroup.querySelectorAll('li');
    for (const li of liData) {
      const firstP = li.querySelector('p')!;
      src += '@' + firstP.textContent;
    }
  }

  // 2024 onward
  // get elements with meeting schedule data: h3
  if (src.length === 0) {
    const h3Texts = htmlItem.querySelectorAll('h3');

    let songIndex = 0;

    for (const h3 of h3Texts) {
      let isSong = h3.classList.contains('dc-icon--music');
      const part = h3.parentNode.classList.contains('boxContent') === false;

      if (!isSong) {
        isSong = h3.querySelector('.dc-icon--music') ? true : false;
      }

      if (isSong) {
        songIndex++;
      }

      if (isSong || part) {
        let data = '';

        data = h3.textContent;

        if (isSong) {
          data = data.replace('|', '@');
        }

        src += '@' + data;

        const nextSibling = h3.nextElementSibling;

        if (nextSibling) {
          const nextElement = nextSibling.querySelector('p');

          if (nextElement) {
            // handle element exception in mwb25.09
            if (isSong && songIndex === 2 && nextSibling.tagName === 'DIV') {
              src += '@' + nextElement.textContent;

              const tmpSibling = nextSibling.nextElementSibling?.querySelector('p');

              if (tmpSibling) {
                src += ' ' + tmpSibling.textContent;
              }

              continue;
            }

            src += ' ' + nextElement.textContent;
          }
        }
      }
    }

    const sepBeforeBR = src.split('@', 5).join('@').length;
    src = src.substring(0, sepBeforeBR) + '@junk@junk' + src.substring(sepBeforeBR);
  }

  src = src.replace(/\u00A0/g, ' '); // remove non-breaking space

  return src;
};

export const getWStudyArticles = (htmlItem: HTMLElement) => {
  return htmlItem.querySelectorAll('h3');
};

export const getWStudyDate = (htmlItem: HTMLElement) => {
  let result: string;

  const p = htmlItem.querySelector('.desc');

  if (p === null) {
    result = htmlItem.textContent.replace(/\u00A0/g, ' '); // remove non-breaking space;
  }

  if (p !== null) {
    result = p.textContent.replace(/\u00A0/g, ' '); // remove non-breaking space;
  }

  return result!;
};

export const getWSTudySongs = (content: HTMLElement) => {
  const pubRefs = content.querySelectorAll('.pubRefs');

  const openingSongText = pubRefs.at(0)!;
  const w_study_opening_song = extractSongNumber(openingSongText.textContent) as number;

  let concludingSongText = <HTMLElement>pubRefs.at(-1);

  if (pubRefs.length === 2) {
    const blockTeach = content.querySelector('.blockTeach');
    concludingSongText = blockTeach!.nextElementSibling!;
  }

  const w_study_concluding_song = extractSongNumber(concludingSongText.textContent) as number;

  return {
    w_study_opening_song,
    w_study_concluding_song,
  };
};

export const getWStudyTitle = (htmlItem: HTMLElement) => {
  let result: string;

  const h2 = htmlItem.querySelector('h2');

  if (h2 === null) {
    const articleLink = htmlItem.nextElementSibling!.querySelector('a')!;
    result = articleLink.textContent.replace(/\u00A0/g, ' '); // remove non-breaking space;;
  }

  if (h2 !== null) {
    result = h2.textContent.trim().replace(/\u00A0/g, ' '); // remove non-breaking space;
  }

  return result!;
};

export const getHTMLDocs = async (zip: JSZip, isMWB: boolean, isW: boolean) => {
  const files = [];

  for (let [filename] of Object.entries(zip.files)) {
    const isValidFile = isValidHTML(filename);

    if (isValidFile) {
      const content = await getHTMLString(zip, filename);
      const htmlDoc = HTMLParse(content);

      const isValidSchedule = isMWB ? isValidMWBSchedule(htmlDoc) : isW ? isValidWSchedule(htmlDoc) : false;

      if (isValidSchedule) {
        files.push(htmlDoc);
      }
    }
  }

  return files;
};

export const parseMWBSchedule = (htmlItem: HTMLElement, mwbYear: number, mwbLang: string) => {
  const isEnhancedParsing = languages.find((language) => language.code === mwbLang);

  const weekItem = {} as MWBSchedule;

  // get week date
  const weekDate = getMWBWeekDate(htmlItem);

  if (isEnhancedParsing) {
    const weekDateEnhanced = extractMWBDate(weekDate, mwbYear, mwbLang);
    weekItem.mwb_week_date = weekDateEnhanced;
    weekItem.mwb_week_date_locale = weekDate;
  } else {
    weekItem.mwb_week_date = weekDate;
  }

  // get weekly Bible Reading
  weekItem.mwb_weekly_bible_reading = getMWBWeeklyBibleReading(htmlItem);

  // compile all sources
  const src = getMWBSources(htmlItem);
  let splits = src.split('@');

  let tmpSrc = '';

  // First song
  weekItem.mwb_song_first = extractSongNumber(splits[1]) as number;

  // 10min TGW Source
  tmpSrc = splits[3].trim();
  if (isEnhancedParsing) {
    const enhanced = extractSourceEnhanced(tmpSrc, mwbLang);
    weekItem.mwb_tgw_talk = enhanced.type;
    weekItem.mwb_tgw_talk_title = enhanced.fulltitle;
  } else {
    weekItem.mwb_tgw_talk = tmpSrc;
  }

  // 10min Spiritual Gems
  tmpSrc = splits[4].trim();
  if (isEnhancedParsing) {
    const enhanced = extractSourceEnhanced(tmpSrc, mwbLang);
    weekItem.mwb_tgw_gems_title = enhanced.fulltitle;
  } else {
    weekItem.mwb_tgw_gems_title = tmpSrc;
  }

  //Bible Reading Source
  tmpSrc = splits[7].trim();
  if (isEnhancedParsing) {
    const enhanced = extractSourceEnhanced(tmpSrc, mwbLang);
    weekItem.mwb_tgw_bread = enhanced.src!;
    weekItem.mwb_tgw_bread_title = enhanced.fulltitle;
  } else {
    weekItem.mwb_tgw_bread = tmpSrc;
  }

  // get number of assignments in Apply Yourself Parts
  const cnAYF = getMWBAYFCount(htmlItem);

  // AYF Part Count
  weekItem.mwb_ayf_count = cnAYF;

  //AYF1 Source
  tmpSrc = splits[8].trim();
  if (isEnhancedParsing) {
    const partEnhanced = extractSourceEnhanced(tmpSrc, mwbLang);
    weekItem.mwb_ayf_part1 = partEnhanced.src!;
    weekItem.mwb_ayf_part1_time = partEnhanced.time;
    weekItem.mwb_ayf_part1_type = partEnhanced.type;
    weekItem.mwb_ayf_part1_title = partEnhanced.fulltitle;
  } else {
    weekItem.mwb_ayf_part1 = tmpSrc;
  }

  //AYF2 Source
  if (cnAYF > 1) {
    tmpSrc = splits[9].trim();
    if (isEnhancedParsing) {
      const partEnhanced = extractSourceEnhanced(tmpSrc, mwbLang);
      weekItem.mwb_ayf_part2 = partEnhanced.src!;
      weekItem.mwb_ayf_part2_time = partEnhanced.time;
      weekItem.mwb_ayf_part2_type = partEnhanced.type;
      weekItem.mwb_ayf_part2_title = partEnhanced.fulltitle;
    } else {
      weekItem.mwb_ayf_part2 = tmpSrc;
    }
  }

  //AYF3 Source
  if (cnAYF > 2) {
    tmpSrc = splits[10].trim();
    if (isEnhancedParsing) {
      const partEnhanced = extractSourceEnhanced(tmpSrc, mwbLang);
      weekItem.mwb_ayf_part3 = partEnhanced.src!;
      weekItem.mwb_ayf_part3_time = partEnhanced.time;
      weekItem.mwb_ayf_part3_type = partEnhanced.type;
      weekItem.mwb_ayf_part3_title = partEnhanced.fulltitle;
    } else {
      weekItem.mwb_ayf_part3 = tmpSrc;
    }
  }

  // AYF4 Source
  if (cnAYF > 3) {
    tmpSrc = splits[11].trim();
    if (isEnhancedParsing) {
      const partEnhanced = extractSourceEnhanced(tmpSrc, mwbLang);
      weekItem.mwb_ayf_part4 = partEnhanced.src;
      weekItem.mwb_ayf_part4_time = partEnhanced.time;
      weekItem.mwb_ayf_part4_type = partEnhanced.type;
      weekItem.mwb_ayf_part4_title = partEnhanced.fulltitle;
    } else {
      weekItem.mwb_ayf_part4 = tmpSrc;
    }
  }

  // Middle song
  let nextIndex = cnAYF > 3 ? 12 : cnAYF > 2 ? 11 : cnAYF > 1 ? 10 : 9;
  weekItem.mwb_song_middle = extractSongNumber(splits[nextIndex]);

  // get number of assignments in Living as Christians Parts
  const cnLC = getMWBLCCount(htmlItem);

  // LC Part Count
  weekItem.mwb_lc_count = cnLC;

  // 1st LC part
  nextIndex++;

  tmpSrc = splits[nextIndex].trim();
  if (isEnhancedParsing) {
    const lcEnhanced = extractSourceEnhanced(tmpSrc, mwbLang);
    weekItem.mwb_lc_part1 = lcEnhanced.type;
    weekItem.mwb_lc_part1_time = lcEnhanced.time;
    weekItem.mwb_lc_part1_title = lcEnhanced.fulltitle;
    if (lcEnhanced.src && lcEnhanced.src !== '') {
      weekItem.mwb_lc_part1_content = lcEnhanced.src;
    }
  } else {
    weekItem.mwb_lc_part1 = tmpSrc;
  }

  // 2nd LC part
  if (cnLC === 2) {
    nextIndex++;
    tmpSrc = splits[nextIndex].trim();

    if (isEnhancedParsing) {
      const lcEnhanced = extractSourceEnhanced(tmpSrc, mwbLang);
      weekItem.mwb_lc_part2 = lcEnhanced.type;
      weekItem.mwb_lc_part2_time = lcEnhanced.time;
      weekItem.mwb_lc_part2_title = lcEnhanced.fulltitle;
      if (lcEnhanced.src && lcEnhanced.src !== '') {
        weekItem.mwb_lc_part2_content = lcEnhanced.src;
      }
    } else {
      weekItem.mwb_lc_part2 = tmpSrc;
    }
  }

  // CBS Source
  nextIndex++;
  tmpSrc = splits[nextIndex].trim();

  if (isEnhancedParsing) {
    const enhanced = extractSourceEnhanced(tmpSrc, mwbLang);
    weekItem.mwb_lc_cbs = enhanced.src!;
    weekItem.mwb_lc_cbs_title = enhanced.fulltitle;
  } else {
    weekItem.mwb_lc_cbs = tmpSrc;
  }

  // Concluding Song
  nextIndex++;
  nextIndex++;
  tmpSrc = splits[nextIndex].trim();
  weekItem.mwb_song_conclude = extractSongNumber(tmpSrc);

  return weekItem;
};

export const parseWSchedule = (article: HTMLElement, content: HTMLElement, wLang: string) => {
  const isEnhancedParsing = languages.find((language) => language.code === wLang);

  const weekItem = {} as WSchedule;

  const studyDate = getWStudyDate(article);

  if (studyDate.length > 0) {
    if (isEnhancedParsing) {
      const wStudyEnhanced = extractWTStudyDate(studyDate, wLang);
      weekItem.w_study_date = wStudyEnhanced;
      weekItem.w_study_date_locale = studyDate;
    } else {
      weekItem.w_study_date = studyDate;
    }
  }

  const studyTitle = getWStudyTitle(article);
  weekItem.w_study_title = studyTitle;

  const songs = getWSTudySongs(content);

  weekItem.w_study_opening_song = songs.w_study_opening_song;
  weekItem.w_study_concluding_song = songs.w_study_concluding_song;

  return weekItem;
};

export const parseMWB = async ({ htmlDocs, year, lang }: { htmlDocs: HTMLElement[]; year: number; lang: string }) => {
  const weeksData = [];

  for (const htmlItem of htmlDocs) {
    const weekItem = parseMWBSchedule(htmlItem, year, lang);
    weeksData.push(weekItem);
  }

  return weeksData;
};
