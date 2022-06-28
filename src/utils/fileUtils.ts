import { logger } from './logger';
// import fs, { PathOrFileDescriptor } from 'fs';
import fs, { PathOrFileDescriptor } from 'fs-extra';
import { Request } from 'express';

export function getContentFile(filePath: PathOrFileDescriptor): String {
  let buffer: Buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (e) {
    logger.error(`Cannot read file in ${filePath} with error: ${e}`);
  }

  return buffer.toString();
}

export function deleteFile(req: Request) {
  if (!req.file) return;
  const filePath = req.file.path;
  fs.removeSync(filePath);
  // console.log(`REMOVE: ${filePath}`);
}

export function deleteFiles(req: Request) {
  if (!req.files) return;
  const files = req.files;

  if (Array.isArray(files)) {
    files.map(x => {
      fs.removeSync(x.path);
      // console.log(`REMOVE: ${x.path}`);
    });
  }
}

export function deleteAllUploadedFileFromFormData(req: Request) {
  deleteFile(req);
  deleteFiles(req);
}
