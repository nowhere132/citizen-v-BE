import { isValidObjectId } from 'mongoose';
import { validateTypes } from '../libs/defaultValidator';
import { generateToken } from '../utils/tokenUtils';
import { tokenExpireTimeInMs } from '../constants/configValues';
import { validateCodeAndLevel } from '../middlewares/userMiddlewares';
import { User, UserLoginDTO } from '../models/user.model';
import langs from '../constants/langs';
import { defaultError, defaultResponse, expressHandler } from '../interfaces/expressHandler';
import * as userRepo from '../repositories/user.repo';
import Logger from '../libs/logger';

const logger = Logger.create('test-api.ts');

const apis: expressHandler[] = [
  // @done, UserRegister
  {
    params: {
      username: validateTypes.USERNAME,
      password: validateTypes.PASSWORD,
      level: 'number|min:1|max:5',
      code: 'string|optional',
    },
    path: '/user/register',
    method: 'POST',
    customMiddleWares: [validateCodeAndLevel],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawUser: User = req.body as User;

        // STEP2: insert to DB
        const user: User = await userRepo.insertUser(rawUser);

        return defaultResponse(res, '', langs.CREATED, user, 201);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, UserLogin
  {
    params: {
      username: validateTypes.USERNAME,
      password: validateTypes.PASSWORD,
    },
    path: '/user/login',
    method: 'POST',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawUser: UserLoginDTO = req.body as UserLoginDTO;

        // STEP2: find in DB
        const condition = { username: rawUser.username };
        const users = await userRepo.getUsersByCondition(condition, 1, 0, { _id: 1 });
        if (users.length === 0) {
          return defaultError(res, 'Không tồn tại tên tài khoản', langs.BAD_REQUEST, null, 400);
        }
        const user = users[0];
        if (user.password !== rawUser.password) {
          return defaultError(res, 'Mật khẩu không đúng', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: generate token
        const token = generateToken(user, tokenExpireTimeInMs);

        return defaultResponse(res, '', langs.SUCCESS, { token, user: users[0] }, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, DeleteUserById
  {
    path: '/user/:id',
    method: 'DELETE',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        // STEP2: delete in DB
        const user: User = await userRepo.deleteUserById(userId);

        return defaultResponse(res, '', langs.SUCCESS, user, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
