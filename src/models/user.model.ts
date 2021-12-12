import mongoose from 'mongoose';
import {
  EightDigitCode, FourDigitCode, SixDigitCode, TwoDigitCode,
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
  level: 1 | 2 | 3 | 4 | 5;
  resourceCode?: TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
  resourceName?: string;
}

const userSchema = new mongoose.Schema<User>(
  {
    username: String,
    password: String,
    name: String,
    level: Number,
    resourceCode: String,
    resourceName: String,
  },
  {
    collection: 'users',
  },
);

const userModel = mongoose.model('user', userSchema);

export default userModel;
