/* eslint-disable implicit-arrow-linebreak */
import quarterModel, { Quarter } from '../models/quarter.model';

const insertQuarters = async (quarters: Quarter[]) => quarterModel.insertMany(quarters);

const getQuartersByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  quarterModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getQuarterById = async (id: string) => quarterModel.findById(id).lean();

const countQuartersByFilters = async (pipe: object): Promise<number> => quarterModel.count(pipe);

export {
  insertQuarters,
  getQuartersByCondition,
  getQuarterById,
  countQuartersByFilters,
};
