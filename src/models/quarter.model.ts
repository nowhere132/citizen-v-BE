import mongoose from 'mongoose';
import {
  TwoDigitCode, FourDigitCode, SixDigitCode, EightDigitCode,
} from '../interfaces/common';

export interface Quarter {
  code: EightDigitCode;
  name: string;
  wardCode: SixDigitCode;
  wardName: string;
  districtCode: FourDigitCode;
  districtName: string;
  provinceCode: TwoDigitCode;
  provinceName: string;
}

const quarterSchema = new mongoose.Schema<Quarter>(
  {
    code: String,
    name: String,
    wardCode: String,
    wardName: String,
    districtCode: String,
    districtName: String,
    provinceCode: String,
    provinceName: String,
  },
  {
    collection: 'quarters',
  },
);

const quarterModel = mongoose.model('quarter', quarterSchema);

export default quarterModel;
