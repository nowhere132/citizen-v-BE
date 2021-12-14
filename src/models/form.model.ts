import mongoose from 'mongoose';
import {
  EightDigitCode, FourDigitCode, SixDigitCode, TwoDigitCode,
} from '../interfaces/common';

export interface CreateFormDTO {
  citizenId: mongoose.Types.ObjectId;
  fullname: string;
  dob: Date;
  gender: 'male' | 'female';
  placeOfOrigin: string;
  placeOfResidence: string;
  shelterAddress: string;
  religion: string;
  levelOfEducation: string;
  job: string;
}

export interface Form extends CreateFormDTO {
  resourceCode: '' | TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
}

const formSchema = new mongoose.Schema<Form>(
  {
    citizenId: mongoose.Types.ObjectId,
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
  },
  {
    collection: 'forms',
  },
);

const formModel = mongoose.model('form', formSchema);

export default formModel;
