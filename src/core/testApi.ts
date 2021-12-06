import langs from '../constants/langs';
import { defaultError, defaultResponse, expressHandler } from '../interfaces/expressHandler';
import Logger from '../libs/logger';

const logger = Logger.create('test-api.ts');

const apis: expressHandler[] = [
  {
    params: {
      $$strict: true,
      username: 'string',
      password: 'string|min:6',
    },
    path: '/test/test-validator',
    method: 'POST',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        logger.info('----- test succeeded -----');
        return defaultResponse(res, '', langs.SUCCESS, { message: '?' }, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
