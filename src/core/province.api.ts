import langs from '../constants/langs';
import { defaultError, expressHandler, pagingResponse } from '../interfaces/expressHandler';
import * as provinceRepo from '../repositories/province.repo';
import Logger from '../libs/logger';

const logger = Logger.create('province.ts');
const apis: expressHandler[] = [
  // @done GetProvincesByCondition
  {
    params: {},
    path: '/province',
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
];

export default apis;
