import { NextFunction, Request, Response } from 'express';
import langs from '../constants/langs';
import { defaultError } from '../interfaces/expressHandler';
import { TokenData } from '../interfaces/token';
import Logger from '../libs/logger';

const logger = Logger.create('user-middleware.ts');

const restrictFormByAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedToken = (req as any).decodedToken as TokenData;
    if (decodedToken.level < 4) {
      return defaultError(res, 'Tài khoản này không phải cấp B', langs.BAD_REQUEST, null, 400);
    }

    if (req.method === 'GET') {
      req.query.resourceCode = decodedToken.resourceCode;
    }
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      req.body.resourceCode = decodedToken.resourceCode;
    }

    return next();
  } catch (err) {
    logger.error('restrictFormByAccessToken err:', err.message);
    return next();
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  restrictFormByAccessToken,
};
