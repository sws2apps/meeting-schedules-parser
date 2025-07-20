import JSZip from 'jszip';

type FileInput = string | { url: string } | Blob | File;

export const isMWBPub = (name: string) => {
  const regex = /^mwb_[A-Z]{1,3}_20[2-9]\d(0[1-9]|1[0-2]).(jwpub|epub)$/i;
  return regex.test(name);
};

export const isWPub = (name: string) => {
  const regex = /^w_[A-Z]{1,3}_20[2-9]\d(0[1-9]|1[0-2]).(jwpub|epub)$/i;
  return regex.test(name);
};

export const validateInput = (input: FileInput) => {
  if (!input) {
    throw new Error('You did not pass anything to the loadPub function.');
  }
};

export const getInputType = (input: FileInput) => {
  const result = { browser: false, node: true };

  if (typeof input === 'object' && 'url' in input) {
    result.browser = true;
  } else if (input instanceof Blob && 'name' in input) {
    result.browser = true;
  }

  return result;
};

export const getPubFileName = (input: FileInput) => {
  let filename: string;

  if (typeof input === 'object' && 'url' in input) {
    filename = input.url;
  } else if (input instanceof Blob && 'name' in input) {
    filename = input.name as string;
  } else {
    filename = input as string;
  }

  return meeting_schedules_parser.path.basename(filename) as string;
};

export const getPubExtension = (filename: string) => {
  return meeting_schedules_parser.path.extname(filename) as '.epub' | '.jwpub';
};

export const isValidPub = (input: FileInput) => {
  const epubFilename = getPubFileName(input);
  const isMWB = isMWBPub(epubFilename);
  const isW = isWPub(epubFilename);

  return isMWB || isW;
};

export const isValidPubIssue = (input: FileInput) => {
  let valid = true;

  const epubFilename = getPubFileName(input);
  const isMWB = isMWBPub(epubFilename);
  const isW = isWPub(epubFilename);

  const type = isMWB ? 'mwb' : isW ? 'w' : undefined;

  const issue = +epubFilename.split('_')[2].split('.epub')[0];

  if (type === 'mwb' && issue < 202207) valid = false;
  if (type === 'w' && issue < 202304) valid = false;

  return valid;
};

export const getPubYear = (input: FileInput) => {
  const filename = getPubFileName(input);
  return +filename.split('_')[2].substring(0, 4);
};

export const getPubLanguage = (input: FileInput) => {
  const filename = getPubFileName(input);
  return filename.split('_')[1];
};

export const getPubData = async (input: FileInput) => {
  let result: Blob | ArrayBuffer | Buffer;

  if (input instanceof Blob) {
    result = input;
  }

  if (typeof input === 'object' && 'url' in input) {
    const pubRes = await fetch(input.url);

    if (pubRes.status !== 200) {
      throw new Error('Publication could not be downloaded. Check the URL you provided.');
    }

    const pubData = await pubRes.blob();
    const data = await pubData.arrayBuffer();

    result = data;
  }

  if (typeof input === 'string') {
    const data = await meeting_schedules_parser.readFile(input);
    result = data;
  }

  return result!;
};

export const validatePubContents = async (data: string | ArrayBuffer | Buffer | Blob) => {
  const MAX_FILES = 300;
  const MAX_SIZE = 20000000; // 20 MO

  let fileCount = 0;
  let totalSize = 0;
  let targetDirectory = 'archive_tmp';

  const result = { isBig: false, isMore: false, isSuspicious: false };

  const appZip = new JSZip();
  const contents = await appZip.loadAsync(data);

  for (let [filename] of Object.entries(contents.files)) {
    fileCount++;
    if (fileCount > MAX_FILES) {
      result.isMore = true;
    }

    // Prevent ZipSlip path traversal (S6096)
    const resolvedPath = meeting_schedules_parser.path.join(targetDirectory, filename);
    if (!resolvedPath.startsWith(targetDirectory)) {
      result.isSuspicious = true;
    }

    const contentSize = await appZip.file(filename)!.async('arraybuffer');
    totalSize += contentSize.byteLength;
    if (totalSize > MAX_SIZE) {
      result.isBig = true;
    }
  }

  fileCount = 0;
  totalSize = 0;

  return result;
};
