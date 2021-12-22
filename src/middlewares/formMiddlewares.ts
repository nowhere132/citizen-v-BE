import { NextFunction, Request, Response } from 'express';
import langs from '../constants/langs';
import { defaultError } from '../interfaces/expressHandler';
import { TokenData } from '../interfaces/token';
import * as userRepo from '../repositories/user.repo';
import Logger from '../libs/logger';

const logger = Logger.create('user-middleware.ts');

const hasPermission = async (rCode: string): Promise<boolean> => {
  let code = rCode;
  while (code.length > 0) {
    // eslint-disable-next-line no-await-in-loop
    const user = await userRepo.getUsersByFilter({ resourceCode: code });
    if (!user || user.permissions !== '1111') return false;
    code = code.slice(0, code.length - 2);
  }
  return true;
};

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

const restrictFormByPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedToken = (req as any).decodedToken as TokenData;
    if (!hasPermission(decodedToken.resourceCode)) {
      return defaultError(res, 'Tài khoản này không có quyền', langs.BAD_REQUEST, null, 400);
    }

    return next();
  } catch (err) {
    logger.error('restrictFormByAccessToken err:', err.message);
    return next();
  }
};

export { restrictFormByAccessToken, restrictFormByPermissions };
