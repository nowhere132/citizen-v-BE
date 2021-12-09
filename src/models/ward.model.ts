import mongoose from 'mongoose';
import { FourDigitCode, SixDigitCode, TwoDigitCode } from '../interfaces/common';

export interface Ward {
  code: SixDigitCode;
  name: string;
  districtCode: FourDigitCode;
  districtName: string;
  provinceCode: TwoDigitCode;
  provinceName: string;
}

const wardSchema = new mongoose.Schema<Ward>(
  {
    code: String,
    name: String,
    districtCode: String,
    districtName: String,
    provinceCode: String,
    provinceName: String,
  },
  {
    collection: 'wards',
  },
);

const wardModel = mongoose.model('ward', wardSchema);

export default wardModel;
