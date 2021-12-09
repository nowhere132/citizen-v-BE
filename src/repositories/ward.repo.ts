/* eslint-disable implicit-arrow-linebreak */
import wardModel from '../models/ward.model';

const getWardsByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  wardModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getWardById = async (id: string) => wardModel.findById(id).lean();

const countWardsByFilters = async (pipe: object): Promise<number> => wardModel.count(pipe);

export {
  getWardsByCondition,
  getWardById,
  countWardsByFilters,
};
