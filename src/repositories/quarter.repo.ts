/* eslint-disable implicit-arrow-linebreak */
import { EightDigitCode } from '../interfaces/common';
import quarterModel, { CreateQuarterDTO, Quarter } from '../models/quarter.model';

const insertQuarter = async (rawQuarter: CreateQuarterDTO): Promise<Quarter> => {
  const quarter: Quarter = {
    ...rawQuarter,
    isFake: true,
  };
  const doc = await quarterModel.create(quarter);
  return (await doc.save()).toObject();
};

const insertQuarters = async (quarters: Quarter[]) =>
  quarterModel.insertMany(quarters, { ordered: false });

const getQuartersByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  quarterModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getQuarterById = async (id: string) => quarterModel.findById(id).lean();

const getQuarterByCode = async (code: EightDigitCode) =>
  quarterModel.findOne({ code }).lean();

const countQuartersByFilters = async (pipe: object): Promise<number> => quarterModel.count(pipe);

const deleteQuarterById = async (id: string) => quarterModel.findByIdAndDelete(id);

export {
  insertQuarter,
  insertQuarters,
  getQuartersByCondition,
  getQuarterById,
  getQuarterByCode,
  countQuartersByFilters,
  deleteQuarterById,
};
