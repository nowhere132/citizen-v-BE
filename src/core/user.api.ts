import { isValidObjectId } from 'mongoose';
import { TokenData } from '../interfaces/token';
import { verifyAccessToken } from '../middlewares/authenToken';
import { restrictByAccessToken, validateUserRegister } from '../middlewares/userMiddlewares';
import { validateTypes } from '../libs/defaultValidator';
import { generateToken } from '../utils/tokenUtils';
import { User, UserLoginDTO } from '../models/user.model';
import langs from '../constants/langs';
import {
  defaultError,
  defaultResponse,
  expressHandler,
  pagingResponse,
} from '../interfaces/expressHandler';
import * as userRepo from '../repositories/user.repo';
import Logger from '../libs/logger';

const logger = Logger.create('user.ts');

const apis: expressHandler[] = [
  // @done, UserRegister
  {
    params: {
      $$strict: true,
      username: validateTypes.USERNAME,
      password: validateTypes.PASSWORD,
      name: validateTypes.NAME,
      phoneNumber: validateTypes.PHONE_NO,
      level: 'number|min:2|max:5',
      resourceCode: 'string',
      resourceName: 'string',
      permissions: validateTypes.PERMISSION_BITS,
    },
    path: '/user/register',
    method: 'POST',
    customMiddleWares: [
      verifyAccessToken,
      validateUserRegister,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawUser: User = req.body as User;

        // STEP2: insert to DB
        const user: User = await userRepo.insertUser(rawUser);

        return defaultResponse(res, '', langs.CREATED, user, 201);
      } catch (err) {
        if (err.code === 11000) {
          return defaultError(res, 'Username đã tồn tại', langs.BAD_REQUEST, null, 400);
        }
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
        const user: User | null = await userRepo.getUserByUsername(rawUser.username);
        if (!user) {
          return defaultError(res, 'Không tồn tại tên tài khoản', langs.BAD_REQUEST, null, 400);
        }
        if (user.password !== rawUser.password) {
          return defaultError(res, 'Mật khẩu không đúng', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: generate token
        const token = generateToken(user);

        return defaultResponse(res, '', langs.SUCCESS, { token, user }, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, GetUsersPaging
  {
    path: '/user',
    method: 'GET',
    customMiddleWares: [
      verifyAccessToken,
      restrictByAccessToken,
    ],
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
        // TODO: add logic resourceCode here

        const usersPromise = userRepo.getUsersByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = userRepo.countUsersByFilters(customedFilter);

        const [users, total] = await Promise.all([usersPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, users, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, GetUserById
  {
    path: '/user/:id',
    method: 'GET',
    customMiddleWares: [
      verifyAccessToken,
      restrictByAccessToken,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        // STEP2: delete in DB
        const user: User = await userRepo.getUserById(userId);

        return defaultResponse(res, '', langs.SUCCESS, user, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, UpdateUserById
  {
    params: {
      $$strict: true,
      permissions: `${validateTypes.PERMISSION_BITS}|optional`,
    },
    customMiddleWares: [
      verifyAccessToken,
      restrictByAccessToken,
    ],
    path: '/user/:id',
    method: 'PATCH',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        const updatingData = req.body;

        // STEP2: delete in DB
        const user: User = await userRepo.updateUserById(userId, updatingData);

        return defaultResponse(res, '', langs.SUCCESS, user, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, ChangeUserPassword
  {
    params: {
      $$strict: true,
      password: validateTypes.PASSWORD,
      oldPassword: `${validateTypes.PASSWORD}|optional`,
    },
    path: '/user/:id/change-password',
    method: 'PATCH',
    customMiddleWares: [
      verifyAccessToken,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        const oldUserInfo = await userRepo.getUserById(userId);
        const userMakingRequest: TokenData = (req as any).decodedToken;
        const requestedByParent = oldUserInfo.parentResourceCode === userMakingRequest.resourceCode;
        const selfRequest = oldUserInfo.resourceCode === userMakingRequest.resourceCode;
        if (!requestedByParent && !selfRequest) {
          return defaultError(res, 'Người đổi không phải cấp trên hoặc chính chủ', langs.UNAUTHORIZED, null, 401);
        }

        // STEP2: delete in DB
        const { password, oldPassword } = req.body;
        if (selfRequest && oldPassword !== oldUserInfo.password) {
          return defaultError(res, 'Mật khẩu cũ không đúng.', langs.BAD_REQUEST, null, 400);
        }
        const user: User = await userRepo.updateUserById(userId, { password });

        return defaultResponse(res, '', langs.SUCCESS, user, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, ChangeUserPermission
  {
    params: {
      $$strict: true,
      permissions: validateTypes.PERMISSION_BITS,
    },
    path: '/user/:id/permissions',
    method: 'PATCH',
    customMiddleWares: [
      verifyAccessToken,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        // STEP2: update in DB
        const { permissions } = req.body;

        const allowedPermissions = ['0100', '1111'];
        if (!allowedPermissions.includes(permissions)) {
          return defaultError(res, 'permission muốn cập nhật không tồn tại', langs.BAD_REQUEST, null, 400);
        }
        const user: User = await userRepo.updateUserById(userId, { permissions });

        return defaultResponse(res, '', langs.SUCCESS, user, 200);
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
    customMiddleWares: [
      verifyAccessToken,
      restrictByAccessToken,
    ],
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
