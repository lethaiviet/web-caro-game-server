import Multer from 'multer';
import { FORDER_PATH } from '@/config';
import fs from 'fs-extra';
import path from 'path';
import { generateRandomFileName } from '@/utils/util';

const storage = Multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = FORDER_PATH['avatar-users'];
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    const nameFile = generateRandomFileName(extname);
    cb(null, nameFile);
  },
});

const FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
  if (FILE_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

const uploadFileMiddleware = Multer({ storage, fileFilter });

export default uploadFileMiddleware;
