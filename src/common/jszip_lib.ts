import JSZip from 'jszip';

export const extractZipFiles = async (data: string | ArrayBuffer | Buffer | Blob | Uint8Array<ArrayBufferLike>) => {
  const appZip = new JSZip();

  const contents = await appZip.loadAsync(data);
  return contents;
};
