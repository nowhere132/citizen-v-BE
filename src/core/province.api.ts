import { isValidObjectId } from 'mongoose';
import { verifyAccessToken } from '../middlewares/authenToken';
import { validateTypes } from '../libs/defaultValidator';
import langs from '../constants/langs';
import {
  defaultError, defaultResponse, expressHandler, pagingResponse,
} from '../interfaces/expressHandler';
import * as provinceRepo from '../repositories/province.repo';
import { CreateProvinceDTO } from '../models/province.model';
import Logger from '../libs/logger';

const logger = Logger.create('province.ts');
const apis: expressHandler[] = [
  // @done AddProvince
  {
    params: {
      $$strict: true,
      code: 'string',
      name: validateTypes.NAME,
    },
    path: '/province',
    method: 'POST',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawProvince: CreateProvinceDTO = req.body;

        // STEP2: insert to DB
        const province = await provinceRepo.insertProvince(rawProvince);
        return defaultResponse(res, '', langs.SUCCESS, province, 200);
      } catch (err) {
        if (err.code === 11000) {
          return defaultError(res, 'Mã này đã tồn tại', langs.BAD_REQUEST, null, 400);
        }
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done GetProvincesByCondition
  {
    params: {},
    path: '/province',
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
        const likeSearchFields = ['name'];
        likeSearchFields.forEach((field) => {
          if (field in filter) {
            customedFilter[field] = { $regex: `.*${filter[field]}.*`, $options: 'i' };
          }
        });

        const provincesPromise = provinceRepo.getProvincesByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = provinceRepo.countProvincesByFilters(customedFilter);

        const [provinces, total] = await Promise.all([provincesPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, provinces, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done Delete Provicne By Id
  {
    path: '/province/:id',
    method: 'DELETE',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const provinceId = req.params.id;
        if (!isValidObjectId(provinceId)) {
          return defaultError(res, 'id không phải object id', langs.BAD_REQUEST, null, 400);
        }

        const province = await provinceRepo.getProvinceById(provinceId);
        if (!province) {
          return defaultError(res, 'Tỉnh/TP không tồn tại', langs.BAD_REQUEST, null, 400);
        }
        if (!province.isFake) {
          return defaultError(res, 'Dữ liệu thật, không được xóa', langs.BAD_REQUEST, null, 400);
        }

        await provinceRepo.deleteProvinceById(provinceId);

        return defaultResponse(res, '', langs.SUCCESS, province, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
