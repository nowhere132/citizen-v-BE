/* eslint-disable implicit-arrow-linebreak */
import { FourDigitCode } from '../interfaces/common';
import districtModel, { CreateDistrictDTO, District } from '../models/district.model';

const insertDistrict = async (rawDistrict: CreateDistrictDTO): Promise<District> => {
  const district: District = {
    ...rawDistrict,
    isFake: true,
  };
  const doc = await districtModel.create(district);
  return (await doc.save()).toObject();
};

const getDistrictsByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  districtModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getDistrictById = async (id: string) => districtModel.findById(id).lean();

const getDistrictByCode = async (code: FourDigitCode) =>
  districtModel.findOne({ code }).lean();

const countDistrictsByFilters = async (pipe: object): Promise<number> => districtModel.count(pipe);

const deleteDistrictById = async (id: string) => districtModel.findByIdAndDelete(id);

export {
  insertDistrict,
  getDistrictsByCondition,
  getDistrictById,
  getDistrictByCode,
  countDistrictsByFilters,
  deleteDistrictById,
};
