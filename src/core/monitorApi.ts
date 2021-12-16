import { verifyAccessToken } from '../middlewares/authenToken';
import langs from '../constants/langs';
import { defaultError, defaultResponse, expressHandler } from '../interfaces/expressHandler';
import Logger from '../libs/logger';

const logger = Logger.create('monitor-api.ts');
const apis: expressHandler[] = [
  // @done Monitor AccessToken
  {
    path: '/monitor/access-token',
    method: 'GET',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return defaultResponse(res, '', langs.SUCCESS);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
