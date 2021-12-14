/* eslint-disable implicit-arrow-linebreak */
import * as jwt from 'jsonwebtoken';
import { jwtSecretKey, tokenExpireTimeInSecond } from '../constants/configValues';

const generateToken = (tokenData: any, expiresIn = tokenExpireTimeInSecond): string =>
  jwt.sign(tokenData, jwtSecretKey, { expiresIn });

// CAN_RAISE_EXCEPTION
const verifyToken = (token: string) => jwt.verify(token, jwtSecretKey);

export {
  generateToken,
  verifyToken,
};
