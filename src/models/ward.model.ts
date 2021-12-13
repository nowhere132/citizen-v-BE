import mongoose from 'mongoose';
import { jobStatuses } from '../constants/configValues';
import { FourDigitCode, SixDigitCode, TwoDigitCode } from '../interfaces/common';

export interface Ward {
  _id?: mongoose.Types.ObjectId;
  code: SixDigitCode;
  name: string;
  districtCode: FourDigitCode;
  districtName: string;
  provinceCode: TwoDigitCode;
  provinceName: string;

  jobId?: string;
  jobStatus?: keyof typeof jobStatuses;
}

const wardSchema = new mongoose.Schema<Ward>(
  {
    code: String,
    name: String,
    districtCode: String,
    districtName: String,
    provinceCode: String,
    provinceName: String,

    jobId: String,
    jobStatus: String,
  },
  {
    collection: 'wards',
  },
);

const wardModel = mongoose.model('ward', wardSchema);

export default wardModel;
