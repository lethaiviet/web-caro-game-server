import { logger } from './logger';
import fs, { PathOrFileDescriptor } from 'fs';

export function getContentFile(filePath: PathOrFileDescriptor): String {
  let buffer: Buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (e) {
    logger.error(`Cannot read file in ${filePath} with error: ${e}`);
  }

  return buffer.toString();
}
