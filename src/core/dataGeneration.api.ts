import langs from '../constants/langs';
import { defaultError, defaultResponse, expressHandler } from '../interfaces/expressHandler';
import Logger from '../libs/logger';

const logger = Logger.create('data-generation.ts');

const apis: expressHandler[] = [
  // @doing, Generate User Data
  {
    params: {},
    path: '/user',
    method: 'POST',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        // TODO: create some random data
        return defaultResponse(res, '', langs.CREATED, {}, 201);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
