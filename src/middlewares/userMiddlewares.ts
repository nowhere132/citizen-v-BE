import { NextFunction, Request, Response } from 'express';
import { TokenData } from '../interfaces/token';
import { User, UserRegisterDTO } from '../models/user.model';
import langs from '../constants/langs';
import * as provinceRepo from '../repositories/province.repo';
import * as districtRepo from '../repositories/district.repo';
import * as wardRepo from '../repositories/ward.repo';
import * as quarterRepo from '../repositories/quarter.repo';
import {
  EightDigitCode, FourDigitCode, SixDigitCode, TwoDigitCode,
} from '../interfaces/common';
import Logger from '../libs/logger';
import { defaultError } from '../interfaces/expressHandler';

const logger = Logger.create('user-middleware.ts');

const checkResourceExisting = async (level: number, code: string) => {
  switch (level) {
    case 2: {
      const province = await provinceRepo.getProvinceByCode(code as TwoDigitCode);
      return province ? [true, province.name] : [false, ''];
    }
    case 3: {
      const district = await districtRepo.getDistrictByCode(code as FourDigitCode);
      return district ? [true, district.name] : [false, ''];
    }
    case 4: {
      const ward = await wardRepo.getWardByCode(code as SixDigitCode);
      return ward ? [true, ward.name] : [false, ''];
    }
    case 5: {
      const quarter = await quarterRepo.getQuarterByCode(code as EightDigitCode);
      return quarter ? [true, quarter.name] : [false, ''];
    }
    default:
      return [false, ''];
  }
};

const validateUserRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawUser: UserRegisterDTO = req.body;
    if ((rawUser.level - 1) * 2 !== rawUser.resourceCode.length) {
      return defaultError(res, 'Level và Code không khớp.', langs.BAD_REQUEST, null, 400);
    }
    const userMakingRequest: User = (req as any).decodedToken;
    if (userMakingRequest.level !== rawUser.level - 1) {
      return defaultError(res, 'Không được phép tạo tài khoản với level này', langs.BAD_REQUEST, null, 400);
    }
    req.body.parentResourceCode = userMakingRequest.resourceCode || '';

    if (rawUser.permissions[1] !== '1') {
      return defaultError(res, 'User luôn có quyền Read', langs.BAD_REQUEST, null, 400);
    }

    const [resourceExisting, resourceName] = await checkResourceExisting(
      rawUser.level,
      rawUser.resourceCode,
    );
    if (!resourceExisting) {
      return defaultError(res, 'Không tồn tại resource này', langs.BAD_REQUEST, null, 400);
    }
    if (resourceName !== rawUser.resourceName) {
      return defaultError(res, 'Tên và code resource không khớp.', langs.BAD_REQUEST, null, 400);
    }

    return next();
  } catch (err) {
    logger.error('validateCodeAndLevel err:', err.message);
    return next();
  }
};

const restrictByAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedToken = (req as any).decodedToken as TokenData;
    if (req.method === 'GET') {
      if (req.query.parentResourceCode
          && req.query.parentResourceCode !== decodedToken.resourceCode) {
        return defaultError(res, 'Không có quyền truy cập', langs.UNAUTHORIZED, null, 401);
      }
      req.query.parentResourceCode = decodedToken.resourceCode;
    }
    if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
      // NOTE: currently do nothing. too flexible to handle
    }
    if (req.method === 'POST') {
      if (req.body.parentResourceCode
          && req.body.parentResourceCode !== decodedToken.resourceCode) {
        return defaultError(res, 'Không có quyền truy cập', langs.UNAUTHORIZED, null, 401);
      }
      req.body.parentResourceCode = decodedToken.resourceCode;
    }

    return next();
  } catch (err) {
    logger.error('validateCodeAndLevel err:', err.message);
    return next();
  }
};

export {
  validateUserRegister,
  restrictByAccessToken,
};
