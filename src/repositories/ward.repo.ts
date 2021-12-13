/* eslint-disable implicit-arrow-linebreak */
import { SixDigitCode } from '../interfaces/common';
import wardModel, { Ward } from '../models/ward.model';

const getWardsByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  wardModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getWardByFilter = async (pipe: object): Promise<Ward> =>
  wardModel.findOne(pipe).lean();

const getWardById = async (id: string) => wardModel.findById(id).lean();

const getWardByCode = async (code: SixDigitCode) =>
  wardModel.findOne({ code }).lean();

const countWardsByFilters = async (pipe: object): Promise<number> => wardModel.count(pipe);

const updateWardByFilter = async (pipe: object, updatingData: object) =>
  wardModel.findOneAndUpdate(pipe, updatingData, { returnOriginal: false });

const updateWardById = async (id: string, updatingData: object) =>
  wardModel.findByIdAndUpdate(id, updatingData);

export {
  getWardsByCondition,
  getWardByFilter,
  getWardById,
  getWardByCode,
  countWardsByFilters,
  updateWardByFilter,
  updateWardById,
};
