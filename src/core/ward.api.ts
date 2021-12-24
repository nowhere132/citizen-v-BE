import { isValidObjectId } from 'mongoose';
import { objectsEqual } from '../utils/common';
import { CreateWardDTO } from '../models/ward.model';
import { verifyAccessToken } from '../middlewares/authenToken';
import { validateTypes } from '../libs/defaultValidator';
import langs from '../constants/langs';
import {
  defaultError, defaultResponse, expressHandler, pagingResponse,
} from '../interfaces/expressHandler';
import * as districtRepo from '../repositories/district.repo';
import * as wardRepo from '../repositories/ward.repo';
import Logger from '../libs/logger';

const logger = Logger.create('ward.ts');
const apis: expressHandler[] = [
  // @done AddWard
  {
    params: {
      $$strict: true,
      code: 'string',
      name: validateTypes.NAME,
      districtCode: 'string',
      districtName: validateTypes.NAME,
      provinceCode: 'string',
      provinceName: validateTypes.NAME,
    },
    path: '/ward',
    method: 'POST',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawWard: CreateWardDTO = req.body;

        // STEP2: check if parent resource was existed
        const district = await districtRepo.getDistrictByCode(rawWard.districtCode);
        if (!district || district.name !== rawWard.districtName
            || !objectsEqual(district, rawWard)('provinceCode', 'provinceName')) {
          return defaultError(res, 'Quận/huyện cấp cha không tồn tại', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: insert to DB
        const ward = await wardRepo.insertWard(rawWard);
        return defaultResponse(res, '', langs.SUCCESS, ward, 200);
      } catch (err) {
        if (err.code === 11000) {
          return defaultError(res, 'Mã này đã tồn tại', langs.BAD_REQUEST, null, 400);
        }
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done GetWardsByCondition
  {
    params: {},
    path: '/ward',
    method: 'GET',
    // customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const { page, perPage, ...filter } = req.query;

        // STEP1: extract paging informations
        const actualPage = +(page || 1);
        const numOfRecords = +(perPage || 10);
        const skip: number = (actualPage - 1) * numOfRecords;
        const defaultSort = { code: 1 };

        // STEP2: custom filter
        const customedFilter = { ...filter };
        const likeSearchFields = ['name', 'districtName', 'provinceName'];
        likeSearchFields.forEach((field) => {
          if (field in filter) {
            customedFilter[field] = { $regex: `.*${filter[field]}.*`, $options: 'i' };
          }
        });

        const wardsPromise = wardRepo.getWardsByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = wardRepo.countWardsByFilters(customedFilter);

        const [wards, total] = await Promise.all([wardsPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, wards, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done Delete Ward By Id
  {
    path: '/ward/:id',
    method: 'DELETE',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const wardId = req.params.id;
        if (!isValidObjectId(wardId)) {
          return defaultError(res, 'id không phải object id', langs.BAD_REQUEST, null, 400);
        }

        const ward = await wardRepo.getWardById(wardId);
        if (!ward) {
          return defaultError(res, 'Phường/xã không tồn tại', langs.BAD_REQUEST, null, 400);
        }
        if (!ward.isFake) {
          return defaultError(res, 'Dữ liệu thật, không được xóa', langs.BAD_REQUEST, null, 400);
        }

        await wardRepo.deleteWardById(wardId);

        return defaultResponse(res, '', langs.SUCCESS, ward, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
