import langs from '../constants/langs';
import { defaultError, expressHandler, pagingResponse } from '../interfaces/expressHandler';
import * as districtRepo from '../repositories/district.repo';
import Logger from '../libs/logger';

const logger = Logger.create('district.ts');
const apis: expressHandler[] = [
  // @done GetDistrictsByCondition
  {
    params: {},
    path: '/district',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const { page, perPage, ...filter } = req.query;

        const actualPage = +(page || 1);
        const numOfRecords = +(perPage || 10);
        const skip: number = (actualPage - 1) * numOfRecords;
        const defaultSort = { code: 1 };

        const districtsPromise = districtRepo.getDistrictsByCondition(
          filter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = districtRepo.countDistrictsByFilters(filter);

        const [districts, total] = await Promise.all([districtsPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, districts, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
