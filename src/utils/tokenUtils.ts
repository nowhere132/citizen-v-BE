/* eslint-disable implicit-arrow-linebreak */
import * as jwt from 'jsonwebtoken';
import { jwtSecretKey, tokenExpireTimeInMs } from '../constants/configValues';

const generateToken = (tokenData: any, expiresIn = tokenExpireTimeInMs): string =>
  jwt.sign(tokenData, jwtSecretKey, { expiresIn });

// CAN_RAISE_EXCEPTION
const verifyToken = (token: string) => jwt.verify(token, jwtSecretKey);

export {
  generateToken,
  verifyToken,
};
