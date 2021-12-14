import mongoose from 'mongoose';
import {
  EightDigitCode, FourDigitCode, PermissionBits, SixDigitCode, TwoDigitCode,
} from '../interfaces/common';

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserDetails {
  name: string;
  phoneNumber: string;
  level: 1 | 2 | 3 | 4 | 5;
  resourceCode: '' | TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
  resourceName?: string;
  permissions: PermissionBits;
}

export interface UserRegisterDTO extends UserLoginDTO, UserDetails {}

export interface User extends UserRegisterDTO {
  _id?: string;
  parentResourceCode?: TwoDigitCode | FourDigitCode | SixDigitCode;
}

const userSchema = new mongoose.Schema<User>(
  {
    username: String,
    password: String,
    name: String,
    phoneNumber: String,
    level: Number,
    parentResourceCode: String,
    resourceCode: String,
    resourceName: String,
    permissions: String,
  },
  {
    collection: 'users',
  },
);

const userModel = mongoose.model('user', userSchema);

export default userModel;
