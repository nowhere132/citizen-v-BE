/* eslint-disable import/prefer-default-export */
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { TokenData } from '../interfaces/token';
import { verifyToken } from '../utils/tokenUtils';
import langs from '../constants/langs';
import { defaultError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';

const logger = Logger.create('authen-token.ts');

const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // STEP1: verify token
    const token: string = req.headers['x-access-token'].toString();
    if (!token) {
      return defaultError(res, 'Request không có token', langs.UNAUTHORIZED, null, 401);
    }

    const decodedToken = verifyToken(token) as TokenData;

    // STEP2: check author
    const restrictedApiPaths = ['/province', '/district', '/ward', '/quarter'];
    let violateRestricted: boolean = false;
    restrictedApiPaths.forEach((apiPath, i) => {
      if (!req.path.includes(apiPath)) return;
      if (decodedToken.level - 1 > i) violateRestricted = true;
    });
    if (violateRestricted) {
      return defaultError(res, 'Không có quyền truy cập resource này.', langs.UNAUTHORIZED, null, 401);
    }

    return next();
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      const errorNames = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'];
      switch (err.name) {
        case errorNames[0]:
          return defaultError(res, err.message, langs.TOKEN_INVALID, null, 401);
        case errorNames[1]:
          return defaultError(res, err.message, langs.TOKEN_EXPIRED, null, 401);
        case errorNames[2]:
          // i don't create nbf, so ...
          break;
        default:
      }
    }

    logger.error('verifyAccessToken err:', err.message);
    return defaultError(res, '', langs.INTERNAL_SERVER_ERROR, {});
  }
};

export { verifyAccessToken };
