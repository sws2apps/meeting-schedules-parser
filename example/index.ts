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

  if (pubIndex >= 0 && issueIndex === -1) {
    console.error('pub type was provided but issue date is missing');
    return;
  }

  const fixture = process.argv.indexOf('fixture');

  const language = process.argv[languageIndex + 1].toUpperCase();
  const issue = issueIndex >= 0 ? process.argv[issueIndex + 1] : undefined;
  const pub = pubIndex >= 0 ? process.argv[pubIndex + 1] : undefined;

  console.time();
  const data = await fetchData(language, issue, pub);

  if (fixture >= 0) {
    // Convert to pretty JSON text
    const json = JSON.stringify(data, null, 2);

    // Write to a file
    writeFileSync(`test/fixtures/${pub}_${language.toUpperCase()}_${issue}.json`, json, 'utf-8');
  }

  console.log(data);
  console.timeEnd();
};

runLiveCommand();
