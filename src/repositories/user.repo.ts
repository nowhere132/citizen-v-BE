/* eslint-disable implicit-arrow-linebreak */
import userModel, { User } from '../models/user.model';

const insertUser = async (user: User): Promise<User> => {
  const doc = await userModel.create(user);
  return (await doc.save()).toObject();
};

const getUsersByCondition = async (pipe: object, limit: number, skip: number, sort: object) =>
  userModel.find(pipe).limit(limit).skip(skip).sort(sort)
    .lean();

const getUserById = async (id: string) => userModel.findById(id).lean();

const countUsersByFilters = async (pipe: object): Promise<number> => userModel.count(pipe);

const deleteUserById = async (id: string) => userModel.findByIdAndDelete(id);

export {
  insertUser,
  getUsersByCondition,
  getUserById,
  countUsersByFilters,
  deleteUserById,
};
