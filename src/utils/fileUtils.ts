import { logger } from './logger';
// import fs, { PathOrFileDescriptor } from 'fs';
import fs, { PathOrFileDescriptor } from 'fs-extra';
import { Request } from 'express';
import path from 'path';

export const ASSETS_FOLDER = path.join(__dirname, '..', 'assets');

export const FORDER_PATH = {
  'email-template': path.join(ASSETS_FOLDER, 'mail-template'),
  'avatar-users': path.join(ASSETS_FOLDER, 'avatar-users'),
};

const STATIC_AVATAR_PATH_FORMAT = '{{origin-url}}/static/avatar-users/{{file-name}}';

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

function getOriginUrl(req: Request): string {
  return `${req.protocol}://${req.headers.host}`;
}

export function getStaticAvatarFilePath(req: Request): string {
  const originUrl = getOriginUrl(req);
  const fileName = req.file.filename;
  const staticFilePath = STATIC_AVATAR_PATH_FORMAT.replace(/{{origin-url}}/g, originUrl).replace(/{{file-name}}/g, fileName);
  return staticFilePath;
}

export function getLocalFilePath(req: Request): string {
  return req.file?.path || '';
}
