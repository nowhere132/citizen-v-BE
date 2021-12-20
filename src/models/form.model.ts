import mongoose from 'mongoose';
import {
  EightDigitCode, FourDigitCode, SixDigitCode, TwoDigitCode,
} from '../interfaces/common';

export interface CreateFormDTO {
  citizenId: string;
  fullname: string;
  dob: Date;
  gender: 'male' | 'female';
  placeOfOrigin: string;
  placeOfResidence: string;
  shelterAddress: string;
  religion: string;
  levelOfEducation: string;
  job: string;
  resourceCode: '' | TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
}

export interface Form extends CreateFormDTO {
  status: 'PENDING' | 'DONE';
}

const formSchema = new mongoose.Schema<Form>(
  {
    citizenId: String,
    fullname: String,
    dob: Date,
    gender: String,
    placeOfOrigin: String,
    placeOfResidence: String,
    shelterAddress: String,
    religion: String,
    levelOfEducation: String,
    job: String,
    resourceCode: String,
    status: {
      type: String,
      default: 'PENDING',
    },
  },
  {
    collection: 'forms',
  },
);

const formModel = mongoose.model('form', formSchema);

export default formModel;
