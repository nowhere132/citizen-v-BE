import { isValidObjectId } from 'mongoose';
import { CreateQuarterDTO } from '../models/quarter.model';
import { verifyAccessToken } from '../middlewares/authenToken';
import { validateTypes } from '../libs/defaultValidator';
import langs from '../constants/langs';
import {
  defaultError, defaultResponse, expressHandler, pagingResponse,
} from '../interfaces/expressHandler';
import * as wardRepo from '../repositories/ward.repo';
import * as quarterRepo from '../repositories/quarter.repo';
import Logger from '../libs/logger';

const logger = Logger.create('quarter.ts');
const apis: expressHandler[] = [
  // @done AddQuarter
  {
    params: {
      $$strict: true,
      code: 'string',
      name: validateTypes.NAME,
      wardCode: 'string',
      wardName: validateTypes.NAME,
      provinceCode: 'string',
      provinceName: validateTypes.NAME,
    },
    path: '/quarter',
    method: 'POST',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawQuarter: CreateQuarterDTO = req.body;

        // STEP2: check if parent resource was existed
        const ward = await wardRepo.getWardByCode(rawQuarter.wardCode);
        if (!ward) {
          return defaultError(res, 'Phường/xã cấp cha không tồn tại', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: insert to DB
        const quarter = await quarterRepo.insertQuarter(rawQuarter);
        return defaultResponse(res, '', langs.SUCCESS, quarter, 200);
      } catch (err) {
        if (err.code === 11000) {
          return defaultError(res, 'Mã này đã tồn tại', langs.BAD_REQUEST, null, 400);
        }
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done GetQuartersByCondition
  {
    params: {},
    path: '/quarter',
    method: 'GET',
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
        const likeSearchFields = ['name', 'wardName', 'districtName', 'provinceName'];
        likeSearchFields.forEach((field) => {
          if (field in filter) {
            customedFilter[field] = { $regex: `.*${filter[field]}.*`, $options: 'i' };
          }
        });

        const quartersPromise = quarterRepo.getQuartersByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = quarterRepo.countQuartersByFilters(customedFilter);

        const [quarters, total] = await Promise.all([quartersPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, quarters, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done Delete Quarter By Id
  {
    path: '/quarter/:id',
    method: 'DELETE',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const quarterId = req.params.id;
        if (!isValidObjectId(quarterId)) {
          return defaultError(res, 'id không phải object id', langs.BAD_REQUEST, null, 400);
        }

        const quarter = await quarterRepo.getQuarterById(quarterId);
        if (!quarter) {
          return defaultError(res, 'Tổ dân phố không tồn tại', langs.BAD_REQUEST, null, 400);
        }
        if (!quarter.isFake) {
          return defaultError(res, 'Dữ liệu thật, không được xóa', langs.BAD_REQUEST, null, 400);
        }

        await quarterRepo.deleteQuarterById(quarterId);

        return defaultResponse(res, '', langs.SUCCESS, quarter, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
