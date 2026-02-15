import '../browser/utils.browser.js';
import { getInputType, validateInput } from '../common/file_validation.js';
import { startParse } from '../common/parser.js';
import { MWBSchedule, WSchedule } from '../types/index.js';

export type { MWBSchedule, WSchedule };

export const loadPub = async (epubInput: File | Blob | { url: string }) => {
  try {
    validateInput(epubInput);

    // Step: Validate Environment
    const { browser } = getInputType(epubInput);
    if (!browser) {
      throw new Error(
        'You are using the Browser version of meeting-schedules-parser. Please switch to the Node version if needed.'
      );
    }

    // Step: Start Parsing
    const data = await startParse(epubInput);
    return data as any;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
};
