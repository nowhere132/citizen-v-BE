import langs from '../constants/langs';
import { defaultError, expressHandler, pagingResponse } from '../interfaces/expressHandler';
import * as wardRepo from '../repositories/ward.repo';
import Logger from '../libs/logger';

const logger = Logger.create('district.ts');
const apis: expressHandler[] = [
  // @done GetWardsByCondition
  {
    params: {},
    path: '/ward',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const { page, perPage, ...filter } = req.query;

        const actualPage = +(page || 1);
        const numOfRecords = +(perPage || 10);
        const skip: number = (actualPage - 1) * numOfRecords;
        const defaultSort = { code: 1 };

        const wardsPromise = wardRepo.getWardsByCondition(
          filter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = wardRepo.countWardsByFilters(filter);

        const [wards, total] = await Promise.all([wardsPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, wards, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
