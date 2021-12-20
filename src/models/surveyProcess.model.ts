import mongoose from 'mongoose';
import {
  EightDigitCode, FourDigitCode, SixDigitCode, TwoDigitCode,
} from '../interfaces/common';

export interface CreateSurveyProcessDTO {
  resourceCode: '' | TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
  createdAt: Date;
  expiresAt: Date;
}

export interface SurveyProcess extends CreateSurveyProcessDTO {
  totalForms: number;
  doneForms: number;
  status: 'DOING' | 'DONE';
}

const suveryProcessSchema = new mongoose.Schema<SurveyProcess>(
  {
    resourceCode: String,
    createdAt: Date,
    expiresAt: Date,
    totalForms: Number,
    doneForms: Number,
    status: String,
  },
  {
    collection: 'survey_processes',
  },
);

const surveyProcessModel = mongoose.model('survey_process', suveryProcessSchema);

export default surveyProcessModel;
