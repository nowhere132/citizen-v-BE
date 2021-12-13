import langs from '../constants/langs';
import { defaultError, expressHandler, pagingResponse } from '../interfaces/expressHandler';
import * as quarterRepo from '../repositories/quarter.repo';
import Logger from '../libs/logger';

const logger = Logger.create('district.ts');
const apis: expressHandler[] = [
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
];

export default apis;
