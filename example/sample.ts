import { loadPub } from '../src/node/index.js';

const JW_CDN = 'https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?';
const MWB_DISCOVERY_START = 202401;
const W_DISCOVERY_START = 202310;

type Issue = {
  issueDate: string;
  currentYear: number;
  language: string;
  pub: 'mwb' | 'w';
  EPUB?: { file: { url: string } }[];
  JWPUB?: { file: { url: string } }[];
};

const fetchIssueData = async (issue: Issue): Promise<any> => {
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
};

const discoverIssues = async (language: string, pub: 'mwb' | 'w'): Promise<Issue[]> => {
  const issues: Issue[] = [];
  let notFound = false;

  const startIssue = pub === 'mwb' ? MWB_DISCOVERY_START : W_DISCOVERY_START;
  let currentYear = +String(startIssue).slice(0, 4);
  let currentMonth = +String(startIssue).slice(4, 6);

  do {
    const issueDate = currentYear + String(currentMonth).padStart(2, '0');
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

      issues.push({ issueDate, currentYear, language, pub, EPUB, JWPUB });
    }

    if (res.status === 404) {
      notFound = true;
    }

    if (pub === 'mwb') {
      currentMonth += 2;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    } else {
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
  } while (notFound === false);

  return issues;
};

export const fetchData = async (language: string, issue: string | undefined, pub: string | undefined) => {
  try {
    let data: any[] = [];
    const autoDiscoveryPubs: ('mwb' | 'w')[] =
      !issue && pub ? [pub as 'mwb' | 'w'] : !issue && !pub ? ['mwb', 'w'] : [];

    if (autoDiscoveryPubs.length > 0) {
      for (const currentPub of autoDiscoveryPubs) {
        const issues = await discoverIssues(language, currentPub);

        for (const item of issues) {
          console.log(`\n[${item.pub}] issue=${item.issueDate} language=${language}`);
          const parsed = await fetchIssueData(item);
          console.log(parsed);
          data.push({
            pub: item.pub,
            issue: item.issueDate,
          });
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

        data = await fetchIssueData({
          issueDate: issue,
          currentYear: +issue.substring(0, 4),
          language,
          pub: pub as 'mwb' | 'w',
          EPUB,
          JWPUB,
        });
      }
    }

    return data;
  } catch (err: any) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
};
