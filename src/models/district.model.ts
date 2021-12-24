import mongoose from 'mongoose';
import { FourDigitCode, TwoDigitCode } from '../interfaces/common';

export interface CreateDistrictDTO {
  code: FourDigitCode;
  name: string;
  provinceCode: TwoDigitCode;
  provinceName: string;
}

export interface District extends CreateDistrictDTO {
  isFake?: boolean;
}

const districtSchema = new mongoose.Schema<District>(
  {
    code: String,
    name: String,
    provinceCode: String,
    provinceName: String,
    isFake: Boolean,
  },
  {
    collection: 'districts',
  },
);
districtSchema.index({ code: 1 }, { unique: true });
districtSchema.index({ provinceCode: 1, code: 1 }, { unique: true });

const districtModel = mongoose.model('district', districtSchema);

export default districtModel;
