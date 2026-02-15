import './utils.node.js';
import { startParse } from '../common/parser.js';
import { MWBSchedule, WSchedule } from '../types/index.js';
import { validateInput } from '../common/file_validation.js';

export type { MWBSchedule, WSchedule };

export const loadPub = async (epubInput: string | Blob | { url: string }) => {
  try {
    validateInput(epubInput);

    const data = await startParse(epubInput);
    return data as any;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
};
