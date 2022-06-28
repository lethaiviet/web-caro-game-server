import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { deleteAllUploadedFileFromFormData } from '@/utils/fileUtils';

const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');

        //to verify the fields from form-data, we need apply multer before this middleware
        //multer will return the body contains all fields need to verify
        //and req.file/req.files contains filename/path, download those files when passing type/size are
        //defined from uploadFile.middleware
        //Hence, need delete all when having any error in this middleware
        deleteAllUploadedFileFromFormData(req);
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
