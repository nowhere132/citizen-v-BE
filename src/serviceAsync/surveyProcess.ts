import { EightDigitCode, SixDigitCode } from '../interfaces/common';
import * as surveyProcessRepo from '../repositories/surveyProcess.repo';
import Logger from '../libs/logger';

const logger = Logger.create('surveyProcess-async.ts');

const updateTotalForms = async (resourceCode: EightDigitCode, diff: number) => {
  try {
    // logger.info('----- updateTotalForms START -----');
    const countryCode = '';
    const provinceCode = resourceCode.slice(0, 2);
    const districtCode = resourceCode.slice(0, 4);
    const wardCode = resourceCode.slice(0, 6);

    const pipe = (x: string) => ({ resourceCode: x });
    const updatingData = {
      $inc: { totalForms: diff },
      $setOnInsert: {
        createdAt: new Date('2021-01-01T00:00:00Z'),
        expiresAt: new Date('2021-12-31T00:00:00Z'),
        doneForms: 0,
        status: 'DOING',
      },
    };
    const opts = { returnOriginal: false, upsert: true };

    const promises = [
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(countryCode), updatingData, opts),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(provinceCode), updatingData, opts),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(districtCode), updatingData, opts),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(wardCode), updatingData, opts),
    ];
    await Promise.all(promises);
    // logger.info('----- updateTotalForms FINISH -----');
  } catch (err) {
    logger.error('updateTotalForms:', err.message);
  }
};

const updateDoneForms = async (resourceCode: EightDigitCode, diff: number) => {
  try {
    // logger.info('----- updateDoneForms START -----');
    const countryCode = '';
    const provinceCode = resourceCode.slice(0, 2);
    const districtCode = resourceCode.slice(0, 4);
    const wardCode = resourceCode.slice(0, 6);

    const pipe = (x: string) => ({ resourceCode: x });
    const updatingData = {
      $inc: { doneForms: diff },
      $setOnInsert: {
        createdAt: new Date('2021-01-01T00:00:00Z'),
        expiresAt: new Date('2021-12-31T00:00:00Z'),
      },
    };
    const opts = { returnOriginal: false, upsert: true };

    const promises = [
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(countryCode), updatingData, opts),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(provinceCode), updatingData, opts),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(districtCode), updatingData, opts),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(wardCode), updatingData, opts),
    ];
    await Promise.all(promises);
    // logger.info('----- updateDoneForms FINISH -----');
  } catch (err) {
    logger.error('updateDoneForms:', err.message);
  }
};

const updateStatus = async (resourceCode: SixDigitCode, status: 'DOING' | 'DONE') => {
  try {
    logger.info('----- updateStatus START -----');
    const provinceCode = resourceCode.slice(0, 2);
    const districtCode = resourceCode.slice(0, 4);

    const pipe = (x: string) => ({ resourceCode: x });
    const updatingData = { status };

    if (status === 'DOING') {
      const promises = [
        surveyProcessRepo.updateSurveyProcessByFilter(pipe(provinceCode), updatingData),
        surveyProcessRepo.updateSurveyProcessByFilter(pipe(districtCode), updatingData),
      ];
      await Promise.all(promises);
    } else {
      const districtCnt = await surveyProcessRepo.countSurveyProcesssByFilters({
        resourceCode: { $regex: `^${districtCode}[0-9]{2}$` },
        status: 'DOING',
      });
      const provinceCnt = await surveyProcessRepo.countSurveyProcesssByFilters({
        resourceCode: { $regex: `^${provinceCode}[0-9]{2}$` },
        status: 'DOING',
      });

      const promises = [];
      if (districtCnt === 0) {
        promises.push(
          surveyProcessRepo.updateSurveyProcessByFilter(pipe(districtCode), updatingData),
        );
      }
      if (provinceCnt === 1) {
        promises.push(
          surveyProcessRepo.updateSurveyProcessByFilter(pipe(provinceCode), updatingData),
        );
      }
      await Promise.all(promises);
    }

    logger.info('----- updateStatus FINISH -----');
  } catch (err) {
    logger.error('updateStatus:', err.message);
  }
};

export { updateTotalForms, updateDoneForms, updateStatus };
