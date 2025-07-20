import { loadPub } from '../src/node/index.js';

const JW_CDN = 'https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?';
const WOL_E = 'https://wol.jw.org/wol/dt/r1/lp-e';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Issue = {
  issueDate: string;
  currentYear: number;
  language: string;
  EPUB?: { file: { url: string } }[];
  JWPUB?: { file: { url: string } }[];
};

const fetchIssueData = async (issue: Issue): Promise<any> => {
  try {
    if (issue.JWPUB) {
      const fileUrl = issue.JWPUB[0].file.url;
      const pubData = await loadPub({ url: fileUrl });
      return pubData;
    }

    if (issue.EPUB) {
      const fileUrl = issue.EPUB[0].file.url;
      const pubData = await loadPub({ url: fileUrl });
      return pubData;
    }

    if (!issue.JWPUB && !issue.EPUB) {
      return [];
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const fetchData = async (language: string, issue: string | undefined, pub: string | undefined) => {
  let data: { mwb_week_date?: string; w_study_date?: string; week_date: string }[] = [];

  if (!issue && !pub) {
    for await (const pub of ['mwb', 'w']) {
      const issues: Issue[] = [];

      if (pub === 'mwb') {
        let notFound = false;

        // get current issue
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const weekDate = new Date(today.setDate(diff));
        const validDate = weekDate.setMonth(weekDate.getMonth());

        const startDate = new Date(validDate);
        const currentMonth = startDate.getMonth() + 1;
        const monthOdd = currentMonth % 2 === 0 ? false : true;
        let monthMwb = monthOdd ? currentMonth : currentMonth - 1;
        let currentYear = startDate.getFullYear();

        do {
          const issueDate = currentYear + String(monthMwb).padStart(2, '0');
          const url =
            JW_CDN +
            new URLSearchParams({
              langwritten: language,
              pub,
              output: 'json',
              issue: issueDate,
            });

          const res = await fetch(url);

          if (res.status === 200) {
            const result = await res.json();

            const JWPUB = result.files[language].JWPUB;
            const EPUB = result.files[language].EPUB;

            issues.push({ issueDate, currentYear, language, EPUB, JWPUB });
          }

          if (res.status === 404) {
            notFound = true;
          }

          // assigning next issue
          monthMwb = monthMwb + 2;
          if (monthMwb === 13) {
            monthMwb = 1;
            currentYear++;
          }
        } while (notFound === false);
      }

      if (pub === 'w') {
        let notFound = false;

        // get w current issue
        const today = new Date();
        const url = `${WOL_E}/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

        const res = await fetch(url);
        const data = await res.json();

        const wData = data.items.find((item: any) => item.classification === 68);
        const publicationTitle = wData.publicationTitle;

        const findYear = /\b\d{4}\b/;
        const array = findYear.exec(publicationTitle);
        let currentYear = +array![0];

        const monthsRegex = `(${months.join('|')})`;

        const regex = new RegExp(monthsRegex);
        const array2 = regex.exec(publicationTitle);

        let monthW = months.findIndex((month) => month === array2![0]) + 1;

        do {
          const issueDate = currentYear + String(monthW).padStart(2, '0');
          const url =
            JW_CDN +
            new URLSearchParams({
              langwritten: language,
              pub,
              output: 'json',
              issue: issueDate,
            });

          console.log(url);

          const res = await fetch(url);

          if (res.status === 200) {
            const result = await res.json();

            const JWPUB = result.files[language].JWPUB;
            const EPUB = result.files[language].EPUB;

            issues.push({ issueDate, currentYear, language, EPUB, JWPUB });
          }

          if (res.status === 404) {
            notFound = true;
          }

          // assigning next issue
          monthW = monthW + 1;
          if (monthW === 13) {
            monthW = 1;
            currentYear++;
          }
        } while (notFound === false);
      }

      if (issues.length > 0) {
        const fetchSource1 = fetchIssueData(issues[0]);
        const fetchSource2 = issues.length > 1 ? fetchIssueData(issues[1]) : Promise.resolve([]);
        const fetchSource3 = issues.length > 2 ? fetchIssueData(issues[2]) : Promise.resolve([]);
        const fetchSource4 = issues.length > 3 ? fetchIssueData(issues[3]) : Promise.resolve([]);
        const fetchSource5 = issues.length > 4 ? fetchIssueData(issues[4]) : Promise.resolve([]);
        const fetchSource6 = issues.length > 5 ? fetchIssueData(issues[5]) : Promise.resolve([]);
        const fetchSource7 = issues.length > 6 ? fetchIssueData(issues[6]) : Promise.resolve([]);

        const allData = await Promise.all([
          fetchSource1,
          fetchSource2,
          fetchSource3,
          fetchSource4,
          fetchSource5,
          fetchSource6,
          fetchSource7,
        ]);

        for (let z = 0; z < allData.length; z++) {
          const tempObj: any = allData[z];
          if (tempObj.length > 0) {
            for (const src of tempObj) {
              const date = src.mwb_week_date || src.w_study_date;

              const prevSrc = data.find((item) => item.mwb_week_date === date || item.w_study_date === date);

              if (prevSrc) {
                Object.assign(prevSrc, src);
              }

              if (!prevSrc) {
                data.push(src);
              }
            }
          }
        }
      }
    }

    for (const src of data) {
      if (src.mwb_week_date) {
        src.week_date = src.mwb_week_date;
        delete src.mwb_week_date;
      }

      if (src.w_study_date) {
        src.week_date = src.w_study_date;
        delete src.w_study_date;
      }
    }
  }

  if (issue && pub) {
    const url = JW_CDN + new URLSearchParams({ langwritten: language, pub, output: 'json', issue });

    const res = await fetch(url);

    if (res.status === 200) {
      const result = await res.json();

      const JWPUB = result.files[language].JWPUB;
      const EPUB = result.files[language].EPUB;

      data = await fetchIssueData({ issueDate: issue, currentYear: +issue.substring(0, 4), language, EPUB, JWPUB });
    }
  }

  return data;
};
