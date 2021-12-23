import mongoose from 'mongoose';
import { TwoDigitCode } from '../interfaces/common';

export interface CreateProvinceDTO {
  code: TwoDigitCode;
  name: string;
}
export interface Province extends CreateProvinceDTO {
  isFake?: boolean;
}

const provinceSchema = new mongoose.Schema<Province>(
  {
    code: String,
    name: String,
    isFake: Boolean,
  },
  {
    collection: 'provinces',
  },
);

const provinceModel = mongoose.model('province', provinceSchema);

export default provinceModel;
