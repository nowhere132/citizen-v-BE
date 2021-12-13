import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
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
    const rawUser: User = req.body;
    if ((rawUser.level - 1) * 2 !== rawUser.resourceCode.length) {
      return defaultError(res, 'Level và Code không khớp.', langs.BAD_REQUEST, null, 400);
    }

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

export {
  // eslint-disable-next-line import/prefer-default-export
  validateUserRegister,
};
