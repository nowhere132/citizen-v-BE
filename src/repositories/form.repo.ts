/* eslint-disable implicit-arrow-linebreak */
import formModel, { Form } from '../models/form.model';

const insertForm = async (form: Form): Promise<Form> => {
  const doc = await formModel.create(form);
  return (await doc.save()).toObject();
};

const getFormsByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  formModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getFormById = async (id: string) => formModel.findById(id).lean();

const countFormsByFilters = async (pipe: object): Promise<number> => formModel.count(pipe);

export {
  insertForm,
  getFormsByCondition,
  getFormById,
  countFormsByFilters,
};
