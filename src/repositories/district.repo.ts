/* eslint-disable implicit-arrow-linebreak */
import { FourDigitCode } from '../interfaces/common';
import districtModel from '../models/district.model';

const getDistrictsByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  districtModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getDistrictById = async (id: string) => districtModel.findById(id).lean();

const getDistrictByCode = async (code: FourDigitCode) =>
  districtModel.findOne({ code }).lean();

const countDistrictsByFilters = async (pipe: object): Promise<number> => districtModel.count(pipe);

export {
  getDistrictsByCondition,
  getDistrictById,
  getDistrictByCode,
  countDistrictsByFilters,
};
