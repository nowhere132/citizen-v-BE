import mongoose from 'mongoose';

export interface Province {
  code: string;
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
