import mongoose from 'mongoose';
import {
  TwoDigitCode, FourDigitCode, SixDigitCode, EightDigitCode,
} from '../interfaces/common';

export interface CreateQuarterDTO {
  code: EightDigitCode;
  name: string;
  wardCode: SixDigitCode;
  wardName: string;
  districtCode: FourDigitCode;
  districtName: string;
  provinceCode: TwoDigitCode;
  provinceName: string;
}

export interface Quarter extends CreateQuarterDTO {
  isFake?: boolean;
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
    isFake: Boolean,
  },
  {
    collection: 'quarters',
  },
);

const quarterModel = mongoose.model('quarter', quarterSchema);

export default quarterModel;
