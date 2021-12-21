/* eslint-disable implicit-arrow-linebreak */
import formModel, { CreateFormDTO, Form } from '../models/form.model';

const insertForm = async (form: CreateFormDTO): Promise<Form> => {
  const doc = await formModel.create(form);
  return (await doc.save()).toObject();
};

const getFormsByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  formModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getFormById = async (id: string) => formModel.findById(id).lean();

const countFormsByFilters = async (pipe: object): Promise<number> => formModel.countDocuments(pipe);

const updateFormById = async (
  id: string,
  updatingData: object,
  opts: object = { returnOriginal: false },
): Promise<Form> =>
  formModel.findByIdAndUpdate(id, updatingData, opts).lean();

const deleteFormById = async (id: string) => formModel.findByIdAndDelete(id);

export {
  insertForm,
  getFormsByCondition,
  getFormById,
  countFormsByFilters,
  updateFormById,
  deleteFormById,
};
