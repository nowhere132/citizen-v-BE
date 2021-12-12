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
  level: 1 | 2 | 3 | 4 | 5;
  code?: TwoDigitCode | FourDigitCode | SixDigitCode | EightDigitCode;
}

const userSchema = new mongoose.Schema<User>(
  {
    code: String,
    username: String,
    password: String,
  },
  {
    collection: 'users',
  },
);

const userModel = mongoose.model('user', userSchema);

export default userModel;
