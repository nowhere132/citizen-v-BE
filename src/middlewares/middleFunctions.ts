/* eslint-disable @typescript-eslint/no-unused-vars */
import express, {
  Request, Response, NextFunction,
} from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('middle-functions.ts');
export default [
  express.json({ limit: '50mb' }),
  express.urlencoded({ extended: true, limit: '50mb' }),
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        message: 'Malformed JSON in request body',
        code: langs.MALFORMED_JSON_REQUEST_BODY,
      });
    }
    return next();
  },
];
