/* eslint-disable implicit-arrow-linebreak */
import * as jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { TokenData } from '../interfaces/token';
import { jwtSecretKey, tokenExpireTimeInSecond } from '../constants/configValues';

const generateToken = (user: User, expiresIn = tokenExpireTimeInSecond): string => {
  const tokenData: TokenData = {
    _id: user._id,
    username: user.username,
    name: user.name,
    phoneNumber: user.phoneNumber,
    resourceCode: user.resourceCode,
    resourceName: user.resourceName,
    level: user.level,
    permissions: user.permissions,
  };
  return jwt.sign(tokenData, jwtSecretKey, { expiresIn });
};

// CAN_RAISE_EXCEPTION
const verifyToken = (token: string) => jwt.verify(token, jwtSecretKey);

export {
  generateToken,
  verifyToken,
};
