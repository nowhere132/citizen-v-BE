import { Request, Response, NextFunction } from 'express';
import Logger from '../libs/logger';
import apis from '../core/api';
import langs from '../constants/langs';
import { expressHandler } from '../interfaces/expressHandler';
import defaultValidator from '../libs/defaultValidator';

const logger = Logger.create('request validate');
interface expressHandlerExt extends expressHandler {
  regexText: string;
}
function resolveSchema(path: string, method: string) {
  let schema = {};
  apis.forEach((api: expressHandlerExt) => {
    const checkPath = path.split('?')[0].slice(1);
    if (api.method === method && api.params && new RegExp(api.regexText, 'i').test(checkPath)) {
      // logger.info('got schema', api.params, api.method, api.regexText);
      schema = { ...api.params };
    }
  });
  return schema;
}

const v = defaultValidator();

// eslint-disable-next-line consistent-return
function schemaCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const check = v.compile(resolveSchema(req.originalUrl, req.method));
    const match = check(req.body);
    if (match !== true) {
      return res.status(400).json({
        success: false,
        message: 'Validator Error',
        code: langs.VALIDATOR_ERROR,
        data: match,
      });
    }
    next();
  } catch (e) {
    logger.error('request validate error', e);
    next();
  }
}
export default schemaCheck;
