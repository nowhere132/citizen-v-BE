import { setTimeout } from 'timers';
import { jobStatuses } from '../constants/configValues';
import { Ward } from '../models/ward.model';
import { Quarter } from '../models/quarter.model';
import { randomInt, randomUuid } from '../utils/common';
import * as wardRepo from '../repositories/ward.repo';
import * as quarterRepo from '../repositories/quarter.repo';
import Logger from '../libs/logger';
import userModel, { User } from '../models/user.model';

const logger = Logger.create('resource-job.ts');

const quarterGenerating = (ward: Ward, id: number): Quarter => {
  const suffixCode = id.toString().padStart(2, '0');
  return {
    code: ward.code + suffixCode,
    name: `Tổ dân phố ${suffixCode}`,
    wardCode: ward.code,
    wardName: ward.name,
    districtCode: ward.districtCode,
    districtName: ward.districtName,
    provinceCode: ward.provinceCode,
    provinceName: ward.provinceName,
  };
};

// @done
const quarterGeneratingJob = async () => {
  let nextTimeoutInMs = 7 * 1000;
  try {
    logger.info('----- quarterGeneratingJob START -----');

    const noJobBinding = {
      $and: [
        { jobStatus: { $ne: jobStatuses.PROCESSING } },
        { jobStatus: { $ne: jobStatuses.DONE } },
      ],
    };

    const someWards = await wardRepo.getWardsByCondition(noJobBinding, 50, 0, { _id: 1 });
    // logger.info('someWards', someWards);
    if (someWards.length === 0) {
      logger.info('$ quarterGeneratingJob MISSION COMPLETED');
      nextTimeoutInMs = 60 * 60 * 1000;
    }

    const promises = someWards.map(async (ward) => {
      // STEP1: try to get the document
      const jobId: string = randomUuid();
      const updatingWard: any = await wardRepo.updateWardByFilter(
        {
          _id: ward._id,
          ...noJobBinding,
        },
        {
          jobId,
          jobStatus: jobStatuses.PROCESSING,
        },
      );
      // logger.info('$ updatingWard:', updatingWard);
      if (updatingWard.jobId !== jobId) return;

      // STEP2: if got, then start generating data
      const numOfQuarters = randomInt(3, 5);
      const quarters: Quarter[] = [...Array(numOfQuarters)]
        .map((_, i) => quarterGenerating(ward, i));
      await quarterRepo.insertQuarters(quarters);

      await wardRepo.updateWardById(ward._id.toString(), { jobStatus: jobStatuses.DONE });

      // logger.info('$ quarterGeneratingJob: ward', ward.code, '-->', ward.name, 'generated');
    });

    const promiseResults = await Promise.allSettled(promises);
    const failedCases = promiseResults.filter((pr) => pr.status === 'rejected');
    if (failedCases.length > 0) {
      logger.error(`$ quarterGeneratingJob, failed ${failedCases.length} cases`);
    } else {
      logger.info('----- quarterGeneratingJob FINISH -----');
    }
  } catch (err) {
    logger.error('quarterGeneratingJob err:', err.message);
  } finally {
    setTimeout(quarterGeneratingJob, nextTimeoutInMs);
  }
};

// @done
const removeJobDetailsInWard = async () => {
  let nextTimeoutInMs = 1 * 1000;
  try {
    logger.info('----- removeJobDetailsInWard START -----');

    const hasJobDetails = { jobStatus: { $exists: true } };
    const ward = await wardRepo.updateWardByFilter(
      hasJobDetails,
      { $unset: { jobId: '', jobStatus: '' } },
    );
    if (!ward) {
      logger.info('$ removeJobDetailsInWard MISSION COMPLETED');
      nextTimeoutInMs = 60 * 60 * 1000;
    }

    logger.info('----- removeJobDetailsInWard FINISH -----');
  } catch (err) {
    logger.error('removeJobDetailsInWard err:', err.message);
  } finally {
    setTimeout(removeJobDetailsInWard, nextTimeoutInMs);
  }
};

// @done
const createUserA1 = async () => {
  try {
    logger.info('----- removeJobDetailsInWard START -----');

    const user: User = {
      username: 'admin',
      password: '123456',
      name: 'Admin Of CitizenV',
      phoneNumber: '0346743022',
      level: 1,
      permissions: '1111',
    };
    await userModel.findOneAndUpdate({ level: 1 }, user, { upsert: true });

    logger.info('----- removeJobDetailsInWard FINISH -----');
  } catch (err) {
    logger.error('removeJobDetailsInWard err:', err.message);
    setTimeout(createUserA1, 10 * 1000);
  }
};

export {
  quarterGeneratingJob,
  removeJobDetailsInWard,
  createUserA1,
};
