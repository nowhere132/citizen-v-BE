/* eslint-disable implicit-arrow-linebreak */
import provinceModel from '../models/province.model';

const getProvincesByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  provinceModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getProvinceById = async (id: string) => provinceModel.findById(id).lean();

const countProvincesByFilters = async (pipe: object): Promise<number> => provinceModel.count(pipe);

export {
  getProvincesByCondition,
  getProvinceById,
  countProvincesByFilters,
};
