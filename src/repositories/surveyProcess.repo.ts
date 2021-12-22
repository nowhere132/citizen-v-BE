/* eslint-disable implicit-arrow-linebreak */
import surveyProcessModel, {
  CreateSurveyProcessDTO,
  SurveyProcess,
} from '../models/surveyProcess.model';

const upsertSurveyProcess = async (
  surveyProcess: CreateSurveyProcessDTO,
): Promise<SurveyProcess> => {
  const pipe = { resourceCode: surveyProcess.resourceCode };

  const oldSurveyProcess = await surveyProcessModel.findOne(pipe);
  if (oldSurveyProcess) {
    const doc = await surveyProcessModel.findOneAndUpdate(pipe, surveyProcess);
    return doc;
  }
  const rawDoc: SurveyProcess = {
    ...surveyProcess,
    totalForms: 0,
    doneForms: 0,
    status: 'DOING',
  };
  const doc = await surveyProcessModel.create(rawDoc);
  return (await doc.save()).toObject();
};

const getSurveyProcessesByCondition = async (
  pipe: object,
  limit: number,
  skip: number,
  sort: object,
) =>
  surveyProcessModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getSurveyProcessByFilter = async (pipe: object) => surveyProcessModel.findOne(pipe).lean();

const getSurveyProcessById = async (id: string) => surveyProcessModel.findById(id).lean();

const countSurveyProcesssByFilters = async (pipe: object): Promise<number> =>
  surveyProcessModel.count(pipe);

const updateSurveyProcessByFilter = async (
  pipe: object,
  updatingData: object,
  opts: object = { returnOriginal: false },
) =>
  surveyProcessModel.findOneAndUpdate(pipe, updatingData, opts);

export {
  upsertSurveyProcess,
  getSurveyProcessesByCondition,
  getSurveyProcessByFilter,
  getSurveyProcessById,
  countSurveyProcesssByFilters,
  updateSurveyProcessByFilter,
};
