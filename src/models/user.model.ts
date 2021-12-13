import mongoose from 'mongoose';
import {
  EightDigitCode, FourDigitCode, PermissionBits, SixDigitCode, TwoDigitCode,
} from '../interfaces/common';

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface User {
  _id?: string;
  username: string;
  password: string;
  name: string;
  phoneNumber: string;
  level: 1 | 2 | 3 | 4 | 5;
  resourceCode?: TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
  resourceName?: string;
  permissions: PermissionBits;
}

const userSchema = new mongoose.Schema<User>(
  {
    username: String,
    password: String,
    name: String,
    phoneNumber: String,
    level: Number,
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
