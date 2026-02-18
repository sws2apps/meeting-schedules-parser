import { writeFileSync } from 'fs';
import { fetchData } from './sample.js';

const runLiveCommand = async () => {
  const languageIndex = process.argv.indexOf('language');
  if (languageIndex === -1) {
    console.error('language missing from arguments');
    return;
  }

  const issueIndex = process.argv.indexOf('issue');
  const pubIndex = process.argv.indexOf('pub');

  if (issueIndex >= 0 && pubIndex === -1) {
    console.error('issue date was provided but pub type is missing');
    return;
  }

  const fixture = process.argv.indexOf('fixture');

  const language = process.argv[languageIndex + 1].toUpperCase();
  const issue = issueIndex >= 0 ? process.argv[issueIndex + 1] : undefined;
  const pub = pubIndex >= 0 ? process.argv[pubIndex + 1] : undefined;

  if (pub && !['mwb', 'w'].includes(pub)) {
    console.error('pub must be either "mwb" or "w"');
    return;
  }

  if (fixture >= 0 && (!issue || !pub)) {
    console.error('fixture mode requires both issue and pub arguments');
    return;
  }

  console.time();
  const data = await fetchData(language, issue, pub);

  if (data) {
    if (fixture >= 0) {
      const json = JSON.stringify(data, null, 2);
      writeFileSync(`test/e2e/fixtures/${pub}_${language.toUpperCase()}_${issue}.json`, json, 'utf-8');
    }

    if (issue && pub) {
      console.dir(data, { depth: null });
    } else {
      console.log(`Auto discovery completed. Parsed ${data.length} issues.`);
    }
  }

  console.timeEnd();
};

runLiveCommand();
