import { randomUUID } from 'crypto';
import { Quarter } from '../models/quarter.model';
import { randomInt } from '../utils/common';
import * as wardRepo from '../repositories/ward.repo';
import * as quarterRepo from '../repositories/quarter.repo';
import Logger from '../libs/logger';

const logger = Logger.create('resource-job.ts');

// @doing
const quarterGeneratingJob = async () => {
  try {
    logger.info('----- quarterGeneratingJob START -----');
    const condition = {
      jobStatus: { $ne: 'DONE' },
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const jobId: string = randomUUID();

    const someWards = await wardRepo.getWardsByCondition(condition, 50, 0, { _id: 1 });

    const promises = someWards.map(async (ward) => {
      const numOfQuarters = randomInt(3, 5);
      const quarters: Quarter[] = [...Array(numOfQuarters)].map((_, i) => {
        const suffixCode = i.toString().padStart(2, '0');
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
      });

      return quarterRepo.insertQuarters(quarters);
    });

    await Promise.all(promises);

    logger.info('----- quarterGeneratingJob FINISH -----');
  } catch (err) {
    logger.error('quarterGeneratingJob err:', err.message);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { quarterGeneratingJob };
