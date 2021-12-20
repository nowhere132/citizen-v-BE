import { updateStatus, updateTotalForms } from '../serviceAsync/surveyProcess';
import { verifyAccessToken } from '../middlewares/authenToken';
import { _enum } from '../utils/validatorUtils';
import { CreateSurveyProcessDTO, SurveyProcess } from '../models/surveyProcess.model';
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

        // STEP2: insert to DB
        const form: SurveyProcess = await surveyProcessRepo.insertSurveyProcess(rawSurveyProcess);

        return defaultResponse(res, '', langs.CREATED, form, 201);
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

        const { page, perPage, ...filter } = req.query;

        // STEP1: extract paging insurveyProcessations
        const actualPage = +(page || 1);
        const numOfRecords = +(perPage || 10);
        const skip: number = (actualPage - 1) * numOfRecords;
        const defaultSort = { code: 1 };

        // STEP2: custom filter
        const customedFilter = { ...filter };

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
