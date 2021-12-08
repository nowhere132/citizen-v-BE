import { User } from '../models/user.model';
import langs from '../constants/langs';
import { defaultError, defaultResponse, expressHandler } from '../interfaces/expressHandler';
import Logger from '../libs/logger';

const logger = Logger.create('test-api.ts');

const apis: expressHandler[] = [
  // @done, UserLogin
  {
    params: {
      username: 'string',
      password: 'string',
    },
    path: '/user/login',
    method: 'POST',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        // TODO: refactor later
        const hardcodeUsers: User[] = [
          { username: 'manhthd', password: '1', level: 1 },
          { username: 'huytn', password: '2', level: 2 },
        ];

        // STEP1: normalize req body
        const rawUser: User = req.body as User;
        const user: User = hardcodeUsers.find(
          (elem) => elem.username === rawUser.username && elem.password === rawUser.password,
        );

        if (!user) {
          return defaultError(
            res,
            'username hoặc password không đúng',
            langs.BAD_REQUEST,
            null,
            400,
          );
        }
        return defaultResponse(res, '', langs.SUCCESS, { token: 'hardcoded', user }, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
