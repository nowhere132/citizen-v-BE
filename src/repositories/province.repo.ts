/* eslint-disable implicit-arrow-linebreak */
import { TwoDigitCode } from '../interfaces/common';
import provinceModel, { CreateProvinceDTO, Province } from '../models/province.model';

const insertProvince = async (rawProvince: CreateProvinceDTO): Promise<Province> => {
  const province: Province = {
    ...rawProvince,
    isFake: true,
  };
  const doc = await provinceModel.create(province);
  return (await doc.save()).toObject();
};

const getProvincesByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  provinceModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getProvinceById = async (id: string) => provinceModel.findById(id).lean();

const getProvinceByCode = async (code: TwoDigitCode) =>
  provinceModel.findOne({ code }).lean();

const countProvincesByFilters = async (pipe: object): Promise<number> => provinceModel.count(pipe);

const deleteProvinceById = async (id: string) => provinceModel.findByIdAndDelete(id);

export {
  insertProvince,
  getProvincesByCondition,
  getProvinceById,
  getProvinceByCode,
  countProvincesByFilters,
  deleteProvinceById,
};
