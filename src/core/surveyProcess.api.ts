import { updateStatus, updateTotalForms } from '../serviceAsync/surveyProcess';
import { verifyAccessToken } from '../middlewares/authenToken';
import { _enum } from '../utils/validatorUtils';
import { CreateSurveyProcessDTO } from '../models/surveyProcess.model';
import langs from '../constants/langs';
import {
  defaultError,
  defaultResponse,
  expressHandler,
  pagingResponse,
} from '../interfaces/expressHandler';
import * as surveyProcessRepo from '../repositories/surveyProcess.repo';
import Logger from '../libs/logger';

const logger = Logger.create('surveyprocess-api.ts');

const apis: expressHandler[] = [
  // @done, SetSurveyDate
  {
    params: {
      $$strict: true,
      resourceCode: 'string',
      createdAt: {
        type: 'date',
        convert: true,
      },
      expiresAt: {
        type: 'date',
        convert: true,
      },
    },
    path: '/survey-process',
    method: 'POST',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const rawSurveyProcess: CreateSurveyProcessDTO = req.body;

        // STEP2: check all ancestors if existed
        const pipe = (resourceCode: string) => ({ resourceCode });

        let minCreatedAt = new Date('2000-01-01T00:00:00Z');
        let maxExpiresAt = new Date('2100-01-01T00:00:00Z');
        if (rawSurveyProcess.resourceCode !== '') {
          let ancestorCode = rawSurveyProcess.resourceCode.slice(
            0,
            rawSurveyProcess.resourceCode.length - 2,
          );
          // eslint-disable-next-line no-constant-condition
          while (true) {
            // eslint-disable-next-line no-await-in-loop
            const sP = await surveyProcessRepo.getSurveyProcessByFilter(pipe(ancestorCode));
            if (!sP) {
              return defaultError(res, 'Cấp trên chưa khai báo thời gian khảo sát', langs.BAD_REQUEST, null, 400);
            }
            minCreatedAt = sP.createdAt > minCreatedAt ? sP.createdAt : minCreatedAt;
            maxExpiresAt = sP.expiresAt < maxExpiresAt ? sP.expiresAt : maxExpiresAt;

            if (ancestorCode.length) {
              ancestorCode = ancestorCode.slice(0, ancestorCode.length - 2);
            } else {
              break;
            }
          }
        }
        if (rawSurveyProcess.createdAt < minCreatedAt
            || rawSurveyProcess.expiresAt > maxExpiresAt) {
          return defaultError(res, 'Không được khai báo ngoài khoảng cho phép', langs.BAD_REQUEST, null, 400);
        }

        // STEP3: insert to DB
        const surveyProcess = await surveyProcessRepo.upsertSurveyProcess(rawSurveyProcess);

        return defaultResponse(res, '', langs.CREATED, surveyProcess, 201);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, GetSurveyProcessesPaging
  {
    path: '/survey-process',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: extract paging information
        const { page, perPage, ...filter } = req.query;
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

        const surveyProcessesPromise = surveyProcessRepo.getSurveyProcessesByCondition(
          customedFilter,
          numOfRecords,
          skip,
          defaultSort,
        );
        const totalPromise = surveyProcessRepo.countSurveyProcesssByFilters(customedFilter);

        const [surveyProcesss, total] = await Promise.all([surveyProcessesPromise, totalPromise]);

        return pagingResponse(
          res,
          actualPage,
          numOfRecords,
          total,
          '',
          langs.SUCCESS,
          surveyProcesss,
          200,
        );
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, GetSurveyProcessByResourceCode
  {
    path: '/survey-process/:code',
    method: 'GET',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const resourceCode = req.params.code === 'vn' ? '' : req.params.code;
        if (resourceCode.length % 2 > 0 || resourceCode.length > 8) {
          return defaultError(res, 'Mã địa phương không phù hợp', langs.BAD_REQUEST, null, 400);
        }

        const pipe = { resourceCode };
        const surveyProcess = await surveyProcessRepo.getSurveyProcessByFilter(pipe);

        return defaultResponse(res, '', langs.SUCCESS, surveyProcess, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, SelfApprove (B1 only)
  {
    params: {
      $$strict: true,
      resourceCode: 'string|min:6|max:6',
      status: _enum(['DOING', 'DONE']),
    },
    path: '/survey-process/approve',
    method: 'PATCH',
    customMiddleWares: [verifyAccessToken],
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const { resourceCode, status } = req.body;

        // STEP2: update to DB
        const oldSurveyProcess = await surveyProcessRepo.getSurveyProcessByFilter({ resourceCode });
        if (oldSurveyProcess.doneForms !== oldSurveyProcess.totalForms) {
          return defaultError(res, 'Chưa hoàn thành tất cả phiếu khảo sát', langs.BAD_REQUEST, null, 400);
        }

        const surveyProcess = await surveyProcessRepo.updateSurveyProcessByFilter(
          { resourceCode },
          { status },
        );

        // STEP3: create event
        if (oldSurveyProcess.status !== status) {
          updateStatus(oldSurveyProcess.resourceCode, status);
        }

        return defaultResponse(res, '', langs.SUCCESS, surveyProcess, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
  // @done, UpdateTotalForms (B2 only)
  {
    params: {
      $$strict: true,
      resourceCode: 'string|min:8|max:8',
      totalForms: 'number|min:0',
    },
    path: '/survey-process/total-forms',
    method: 'PATCH',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // STEP1: normalize req body
        const { resourceCode, totalForms } = req.body;

        // STEP2: update to DB
        const oldSurveyProcess = await surveyProcessRepo.getSurveyProcessByFilter({ resourceCode });
        if (oldSurveyProcess.doneForms !== oldSurveyProcess.totalForms) {
          return defaultError(res, 'Chưa hoàn thành tất cả phiếu khảo sát', langs.BAD_REQUEST, null, 400);
        }

        const surveyProcess = await surveyProcessRepo.updateSurveyProcessByFilter(
          { resourceCode },
          { totalForms },
        );

        // STEP3: create event
        if (oldSurveyProcess.totalForms !== totalForms) {
          const diff = totalForms - oldSurveyProcess.totalForms;
          updateTotalForms(oldSurveyProcess.resourceCode, diff);
        }

        return defaultResponse(res, '', langs.SUCCESS, surveyProcess, 200);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'err:', err.message);
        return defaultError(res, '', langs.INTERNAL_SERVER_ERROR);
      }
    },
  },
];

export default apis;
