import { NextFunction, Request, Response } from 'express';
import langs from '../constants/langs';
import { defaultError } from '../interfaces/expressHandler';
import { TokenData } from '../interfaces/token';
import * as userRepo from '../repositories/user.repo';
import * as surveyProcessRepo from '../repositories/surveyProcess.repo';
import Logger from '../libs/logger';

const logger = Logger.create('user-middleware.ts');

const restrictFormByAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedToken = (req as any).decodedToken as TokenData;
    if (decodedToken.level < 4) {
      return defaultError(res, 'Tài khoản này không phải cấp B', langs.BAD_REQUEST, null, 400);
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
    let code = decodedToken.resourceCode;
    while (code.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      const user = await userRepo.getUsersByFilter({ resourceCode: code });
      if (!user || user.permissions !== '1111') {
        const target = code === decodedToken.resourceCode ? 'Tài khoản này' : 'Cấp trên';
        return defaultError(res, `${target} không có quyền`, langs.BAD_REQUEST, null, 400);
      }
      code = code.slice(0, code.length - 2);
    }
    return next();
  } catch (err) {
    logger.error('restrictFormByAccessToken err:', err.message);
    return next();
  }
};

const restrictFormBySurveyProcesses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedToken = (req as any).decodedToken as TokenData;
    let code = decodedToken.resourceCode.slice(0, decodedToken.resourceCode.length - 2);
    while (code.length >= 0) {
      // eslint-disable-next-line no-await-in-loop
      const sP = await surveyProcessRepo.getSurveyProcessByFilter({ resourceCode: code });
      if (!sP) {
        return defaultError(res, 'Cấp trên chưa mở đợt khai báo', langs.BAD_REQUEST, null, 400);
      }

      const currentDate = new Date();
      if (sP.createdAt > currentDate || sP.expiresAt < currentDate) {
        return defaultError(
          res,
          'Ngoài khoảng thời gian được phép khai báo',
          langs.BAD_REQUEST,
          null,
          400,
        );
      }

      if (code.length === 0) break;
      code = code.slice(0, code.length - 2);
    }

    return next();
  } catch (err) {
    logger.error('restrictFormBySurveyProcesses err:', err.message);
    return next();
  }
};

export { restrictFormByAccessToken, restrictFormByPermissions, restrictFormBySurveyProcesses };
