import { restrictFormByAccessToken } from '../middlewares/formMiddlewares';
import { verifyAccessToken } from '../middlewares/authenToken';
import { _enum } from '../utils/validatorUtils';
import { validateTypes } from '../libs/defaultValidator';
import langs from '../constants/langs';
import { Form } from '../models/form.model';
import {
  defaultError,
  defaultResponse,
  expressHandler,
  pagingResponse,
} from '../interfaces/expressHandler';
import * as formRepo from '../repositories/form.repo';
import Logger from '../libs/logger';

const logger = Logger.create('form-api.ts');

const apis: expressHandler[] = [
  // @done, CreateForm
  {
    params: {
      $$strict: true,
      citizenId: validateTypes.MONGO_OBJECT_ID,
      fullname: 'string',
      dob: {
        type: 'date',
        convert: true,
      },
      gender: _enum(['male', 'female']),
      placeOfOrigin: 'string',
      placeOfResidence: 'string',
      shelterAddress: 'string',
      religion: 'string',
      levelOfEducation: 'string',
      job: 'string',
    },
    path: '/form',
    method: 'POST',
    customMiddleWares: [verifyAccessToken, restrictFormByAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawForm: Form = req.body as Form;

        // STEP2: insert to DB
        const form: Form = await formRepo.insertForm(rawForm);

        return defaultResponse(res, '', langs.CREATED, form, 201);
      } catch (err) {
        if (err.code === 11000) {
          return defaultError(res, 'CitizenId đã tồn tại', langs.BAD_REQUEST, null, 400);
        }
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, GetFormsPaging
  {
    path: '/form',
    method: 'GET',
    customMiddleWares: [verifyAccessToken],
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

        const formsPromise = formRepo.getFormsByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = formRepo.countFormsByFilters(customedFilter);

        const [forms, total] = await Promise.all([formsPromise, totalPromise]);

        return pagingResponse(res, actualPage, numOfRecords, total, '', langs.SUCCESS, forms, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
