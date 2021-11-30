import mongoose from 'mongoose';
import { TwoDigitCode } from '../interfaces/common';

export interface Province {
  code: TwoDigitCode;
  name: string;
}

const provinceSchema = new mongoose.Schema<Province>(
  {
    code: String,
    name: String,
  },
  {
    collection: 'provinces',
  },
);

const provinceModel = mongoose.model('province', provinceSchema);

export default provinceModel;
