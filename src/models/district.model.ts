import mongoose from 'mongoose';
import { FourDigitCode, TwoDigitCode } from '../interfaces/common';

export interface District {
  code: FourDigitCode;
  name: string;
  provinceCode: TwoDigitCode;
  provinceName: string;
}

const districtSchema = new mongoose.Schema<District>(
  {
    code: String,
    name: String,
    provinceCode: String,
    provinceName: String,
  },
  {
    collection: 'districts',
  },
);

const districtModel = mongoose.model('district', districtSchema);

export default districtModel;
