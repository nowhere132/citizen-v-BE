import { NextFunction, Request, Response } from 'express';
import langs from '../constants/langs';
import { defaultError } from '../interfaces/expressHandler';
import { User } from '../models/user.model';
import Logger from '../libs/logger';

const logger = Logger.create('user-middleware.ts');

const validateCodeAndLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawUser: User = req.body;
    if (rawUser.level === 1) {
      return defaultError(res, 'Tài khoản cấp A1 không có code', langs.BAD_REQUEST, null, 400);
    }
    if ((rawUser.level - 1) * 2 !== rawUser.code.length) {
      return defaultError(res, 'Level và Code không khớp.', langs.BAD_REQUEST, null, 400);
    }

    return next();
  } catch (err) {
    logger.error('validateCodeAndLevel err:', err.message);
    return next();
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  validateCodeAndLevel,
};
