import { MWBSchedule, WSchedule } from '../types/index.js';
import {
  getPubData,
  getPubExtension,
  getPubFileName,
  isValidPub,
  isValidPubIssue,
  validatePubContents,
} from './file_validation.js';
import { parseEPUB } from './epub_parser.js';
import { parseJWPUB } from './jwpub_parser.js';

export const startParse = async (epubInput: string | Blob | { url: string }) => {
  let result: (MWBSchedule | WSchedule)[] = [];

  const isValidName = isValidPub(epubInput);
  if (!isValidName) {
    throw new Error('The selected file has an incorrect naming.');
  }

  const isValiIssue = isValidPubIssue(epubInput);
  if (!isValiIssue) {
    throw new Error(
      'Parsing is only supported for Meeting Workbook starting on July 2022, and for Watchtower Study starting on April 2023.'
    );
  }

  const pubBuffer = await getPubData(epubInput);
  const pubCheck = await validatePubContents(pubBuffer);

  if (pubCheck.isBig) {
    throw new Error('Publication size seems to be large. Parsing aborted.');
  }

  if (pubCheck.isMore) {
    throw new Error('Publication seems to contain more files than expected. Parsing aborted.');
  }

  if (pubCheck.isSuspicious) {
    throw new Error('Publication seems to be suspicious. Parsing aborted.');
  }

  const pubFilename = getPubFileName(epubInput);
  const extension = getPubExtension(pubFilename);

  if (extension === '.jwpub') {
    result = await parseJWPUB(pubFilename, pubBuffer);
  }

  if (extension === '.epub') {
    result = await parseEPUB(pubFilename, pubBuffer);
  }

  return result;
};
