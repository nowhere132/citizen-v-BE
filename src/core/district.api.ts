import { isValidObjectId } from 'mongoose';
import { validateTypes } from '../libs/defaultValidator';
import { verifyAccessToken } from '../middlewares/authenToken';
import { CreateDistrictDTO } from '../models/district.model';
import langs from '../constants/langs';
import {
  defaultError, defaultResponse, expressHandler, pagingResponse,
} from '../interfaces/expressHandler';
import * as provinceRepo from '../repositories/province.repo';
import * as districtRepo from '../repositories/district.repo';
import Logger from '../libs/logger';

const logger = Logger.create('district.ts');
const apis: expressHandler[] = [
  // @done AddDistrict
  {
    params: {
      $$strict: true,
      code: 'string',
      name: validateTypes.NAME,
      provinceCode: 'string',
      provinceName: validateTypes.NAME,
    },
    path: '/district',
    method: 'POST',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawDistrict: CreateDistrictDTO = req.body;

        // STEP2: check if parent resource was existed
        const province = await provinceRepo.getProvinceByCode(rawDistrict.provinceCode);
        if (!province || province.name !== rawDistrict.provinceName) {
          return defaultError(res, 'Tỉnh/TP cấp cha không tồn tại', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: insert to DB
        const district = await districtRepo.insertDistrict(rawDistrict);
        return defaultResponse(res, '', langs.SUCCESS, district, 200);
      } catch (err) {
        if (err.code === 11000) {
          return defaultError(res, 'Mã này đã tồn tại', langs.BAD_REQUEST, null, 400);
        }
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done GetDistrictsByCondition
  {
    params: {},
    path: '/district',
    method: 'GET',
    customMiddleWares: [verifyAccessToken],
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
        const likeSearchFields = ['name', 'provinceName'];
        likeSearchFields.forEach((field) => {
          if (field in filter) {
            customedFilter[field] = { $regex: `.*${filter[field]}.*`, $options: 'i' };
          }
        });

        const districtsPromise = districtRepo.getDistrictsByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = districtRepo.countDistrictsByFilters(customedFilter);

        const [districts, total] = await Promise.all([districtsPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, districts, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done Delete District By Id
  {
    path: '/district/:id',
    method: 'DELETE',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const districtId = req.params.id;
        if (!isValidObjectId(districtId)) {
          return defaultError(res, 'id không phải object id', langs.BAD_REQUEST, null, 400);
        }

        const district = await districtRepo.getDistrictById(districtId);
        if (!district) {
          return defaultError(res, 'Quận/huyện không tồn tại', langs.BAD_REQUEST, null, 400);
        }
        if (!district.isFake) {
          return defaultError(res, 'Dữ liệu thật, không được xóa', langs.BAD_REQUEST, null, 400);
        }

        await districtRepo.deleteDistrictById(districtId);

        return defaultResponse(res, '', langs.SUCCESS, district, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
