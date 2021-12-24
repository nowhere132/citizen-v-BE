import { isValidObjectId } from 'mongoose';
import { TokenData } from '../interfaces/token';
import { updateDoneForms, updateTotalForms } from '../serviceAsync/surveyProcess';
import { restrictByAccessToken } from '../middlewares/userMiddlewares';
import {
  restrictFormByAccessToken,
  restrictFormByPermissions,
  restrictFormBySurveyProcesses,
} from '../middlewares/formMiddlewares';
import { verifyAccessToken } from '../middlewares/authenToken';
import { _enum } from '../utils/validatorUtils';
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
      citizenId: 'string',
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
      resourceCode: 'string|min:8|max:8',
    },
    path: '/form',
    method: 'POST',
    customMiddleWares: [
      verifyAccessToken,
      restrictFormByAccessToken,
      restrictFormByPermissions,
      restrictFormBySurveyProcesses,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const decodedToken = (req as any).decodedToken as TokenData;
        const rawForm: Form = {
          ...req.body,
          status: decodedToken.level === 4 ? 'DONE' : 'PENDING',
        };

        // STEP2: insert to DB
        const form: Form = await formRepo.insertForm(rawForm);

        // STEP3: create event
        updateTotalForms(form.resourceCode, 1);
        if (form.status === 'DONE') updateDoneForms(form.resourceCode, 1);

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
        const groupSearchFields = ['resourceCode'];
        groupSearchFields.forEach((field) => {
          if (field in filter) {
            const orgArray: string[] = filter[field].toString().split(',');
            const regexArray = orgArray.map((v) => new RegExp(`^${v}`));
            (customedFilter as any).resourceCode = { $in: regexArray };
          }
        });

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
  // @done, GetFormById
  {
    path: '/form/:id',
    method: 'GET',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const formId = req.params.id;
        if (!isValidObjectId(formId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        // STEP2: delete in DB
        const form: Form = await formRepo.getFormById(formId);
        if (!form) {
          return defaultError(res, 'Phiếu khảo sát không tồn tại', langs.BAD_REQUEST, null, 400);
        }

        return defaultResponse(res, '', langs.SUCCESS, form, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, UpdateFormById
  {
    params: {
      $$strict: true,
      citizenId: 'string',
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
      resourceCode: 'string|min:8|max:8',
      status: _enum(['PENDING', 'DONE']),
    },
    path: '/form/:id',
    method: 'PUT',
    customMiddleWares: [
      verifyAccessToken,
      restrictFormByAccessToken,
      restrictFormByPermissions,
      restrictFormBySurveyProcesses,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const formId = req.params.id;
        if (!isValidObjectId(formId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        // STEP2: update in DB
        const rawForm: Form = req.body;
        const oldForm: Form | null = await formRepo.getFormById(formId);
        if (!oldForm) {
          return defaultError(res, 'Không tồn tại phiếu khảo sát này.', langs.BAD_REQUEST, null, 400);
        }
        const form: Form = await formRepo.updateFormById(formId, rawForm);

        // STEP3: create event
        if (oldForm.status !== form.status) {
          const diff = oldForm.status === 'PENDING' ? 1 : -1;
          updateDoneForms(form.resourceCode, diff);
        }

        return defaultResponse(res, '', langs.SUCCESS, form, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, DeleteFormById
  {
    path: '/form/:id',
    method: 'DELETE',
    customMiddleWares: [
      verifyAccessToken,
      restrictByAccessToken,
      restrictFormByPermissions,
      restrictFormBySurveyProcesses,
    ],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req param
        const formId = req.params.id;
        if (!isValidObjectId(formId)) {
          return defaultError(res, 'id không phải ObjectId', langs.BAD_REQUEST, null, 400);
        }

        // STEP2: delete in DB
        const form: Form = await formRepo.deleteFormById(formId);
        if (!form) {
          return defaultError(res, 'Phiếu khảo sát không tồn tại', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: create event
        updateTotalForms(form.resourceCode, -1);
        if (form.status === 'DONE') updateDoneForms(form.resourceCode, -1);

        return defaultResponse(res, '', langs.SUCCESS, form, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
