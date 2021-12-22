import quarterModel, { Quarter } from '../models/quarter.model';
import { CreateFormDTO } from '../models/form.model';
import {
  randomCitizenId, randomDate, randomElemInArr, randomInt,
} from '../utils/common';
import * as formRepo from '../repositories/form.repo';
import Logger from '../libs/logger';

const logger = Logger.create('resource-job.ts');

const formGeneratingJob = async () => {
  const nextTimeoutInMs = 3 * 1000;
  try {
    logger.info('----- formGeneratingJob START -----');

    const randomLastnames = [
      'Trần',
      'Nguyễn',
      'Đinh',
      'Trương',
      'Cao',
      'Lê',
      'Trịnh',
      'Hà',
      'Hoàng',
      'Đỗ',
      'Hồ',
      'Tạ',
      'Vũ',
      'Dương',
      'Đặng',
    ];
    const randomFirstnames = [
      'Đức Mạnh',
      'Thành Đô',
      'Bình Minh',
      'Quang Huy',
      'Nhật Huy',
      'Quốc Trung',
      'Kim Đức',
      'Quang Chiều',
      'Thanh Tâm',
      'Minh Ngọc',
      'Quốc Huy',
      'Lệnh Thọ',
      'Quốc Trưởng',
      'Đại Đế',
      'Chúa Hề',
    ];
    const randomJobs = [
      'SE',
      'MarketResearch',
      'DA',
      'DS',
      'Chạn vương',
      'Tổng thống Thanh Hóa',
      'Lũ đế',
      'Lệ tổ',
    ];

    const numLoops = 100;
    const randomQuarters = await quarterModel.aggregate<Quarter>([{ $sample: { size: numLoops } }]);

    const f = async (quarterIndex: number) => {
      const quarter = randomQuarters[quarterIndex];
      const citizen: CreateFormDTO = {
        citizenId: randomCitizenId(),
        fullname: `${randomElemInArr(randomLastnames)} ${randomElemInArr(randomFirstnames)}`,
        dob: randomDate(new Date('1930-01-01T00:00:00Z'), new Date()),
        gender: randomInt(0, 2) ? 'male' : 'female',
        placeOfOrigin: '...',
        placeOfResidence: `${quarter.name}, ${quarter.wardName}, ${quarter.districtName}, ${quarter.provinceName}`,
        shelterAddress: '...',
        religion: 'vn',
        levelOfEducation: randomInt(0, 12).toString().padStart(2, '0'),
        job: randomElemInArr(randomJobs),
        resourceCode: quarter.code,
      };
      return formRepo.insertForm(citizen);
    };

    const promises = [...Array(numLoops)].map(async (_, i) => f(i));
    await Promise.all(promises);

    logger.info('----- formGeneratingJob FINISH -----');
  } catch (err) {
    logger.error('formGeneratingJob err:', err.message);
  } finally {
    setTimeout(formGeneratingJob, nextTimeoutInMs);
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  formGeneratingJob,
};
