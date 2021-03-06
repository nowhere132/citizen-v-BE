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
    return next();
  } catch (e) {
    logger.error('request validate error', e);
    return next();
  }
}

export const prepareRegex = () => {
  apis.forEach((api: expressHandlerExt) => {
    const fullPath = api.path.split('/');
    fullPath.shift();
    let regexText = '\\b';
    fullPath.forEach((i: string) => {
      if (i[0] === ':') { regexText += '\\w*\\/'; } else { regexText += `${i}\\/`; }
    });
    regexText = regexText.slice(0, -2);
    regexText += '\\b(\\/)?$';
    // eslint-disable-next-line no-param-reassign
    api.regexText = regexText;
    logger.info(regexText);
  });
};

export default schemaCheck;
