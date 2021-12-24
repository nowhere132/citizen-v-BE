import mongoose from 'mongoose';
import { jobStatuses } from '../constants/configValues';
import { FourDigitCode, SixDigitCode, TwoDigitCode } from '../interfaces/common';

export interface CreateWardDTO {
  _id?: mongoose.Types.ObjectId;
  code: SixDigitCode;
  name: string;
  districtCode: FourDigitCode;
  districtName: string;
  provinceCode: TwoDigitCode;
  provinceName: string;
}

export interface Ward extends CreateWardDTO {
  isFake?: boolean;
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

    isFake: Boolean,
    jobId: String,
    jobStatus: String,
  },
  {
    collection: 'wards',
  },
);
wardSchema.index({ code: 1 }, { unique: true });
wardSchema.index({ provinceCode: 1, districtCode: 1, code: 1 }, { unique: true });

const wardModel = mongoose.model('ward', wardSchema);

export default wardModel;
