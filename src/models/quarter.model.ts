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
quarterSchema.index({ code: 1 }, { unique: true });
quarterSchema.index({
  provinceCode: 1, districtCode: 1, wardCode: 1, code: 1,
}, { unique: true });

const quarterModel = mongoose.model('quarter', quarterSchema);

export default quarterModel;
