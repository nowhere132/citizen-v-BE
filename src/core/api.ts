import langs from '../constants/langs';
import { expressHandler, defaultResponse, defaultError } from '../interfaces/expressHandler';
import provinceApis from './province.api';
import districtApis from './district.api';
import wardApis from './ward.api';
import quarterApis from './quarter.api';
import testApis from './testApi';
import userApis from './user.api';
import Logger from '../libs/logger';

const logger = Logger.create('api.ts');
const apis: expressHandler[] = [
  {
    params: {},
    customMiddleWares: [],
    path: '/healthcheck',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return defaultResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return defaultError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  ...provinceApis,
  ...districtApis,
  ...wardApis,
  ...quarterApis,
  ...userApis,
  ...testApis, // for nhathuy
];

export default apis;
