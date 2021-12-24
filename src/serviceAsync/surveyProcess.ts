import { EightDigitCode, SixDigitCode } from '../interfaces/common';
import * as surveyProcessRepo from '../repositories/surveyProcess.repo';
import Logger from '../libs/logger';

const logger = Logger.create('surveyProcess-async.ts');

const updateTotalForms = async (resourceCode: EightDigitCode, diff: number) => {
  try {
    logger.info('----- updateTotalForms START -----');
    const provinceCode = resourceCode.slice(0, 2);
    const districtCode = resourceCode.slice(0, 4);
    const wardCode = resourceCode.slice(0, 6);
    const quarterCode = resourceCode;

    const pipe = (x: string) => ({ resourceCode: x });
    const updatingData = { $inc: { doneForms: diff } };

    const promises = [
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(provinceCode), updatingData),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(districtCode), updatingData),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(wardCode), updatingData),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(quarterCode), updatingData),
    ];
    await Promise.all(promises);
    logger.info('----- updateTotalForms FINISH -----');
  } catch (err) {
    logger.error('updateTotalForms:', err.message);
  }
};

const updateDoneForms = async (resourceCode: EightDigitCode, diff: number) => {
  try {
    logger.info('----- updateDoneForms START -----');
    const provinceCode = resourceCode.slice(0, 2);
    const districtCode = resourceCode.slice(0, 4);
    const wardCode = resourceCode.slice(0, 6);
    const quarterCode = resourceCode;

    const pipe = (x: string) => ({ resourceCode: x });
    const updatingData = { $inc: { totalForms: diff } };

    const promises = [
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(provinceCode), updatingData),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(districtCode), updatingData),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(wardCode), updatingData),
      surveyProcessRepo.updateSurveyProcessByFilter(pipe(quarterCode), updatingData),
    ];
    await Promise.all(promises);
    logger.info('----- updateDoneForms FINISH -----');
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
      });
      const provinceCnt = await surveyProcessRepo.countSurveyProcesssByFilters({
        resourceCode: { $regex: `^${provinceCode}[0-9]{2}$` },
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
