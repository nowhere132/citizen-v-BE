const jwtSecretKey = process.env.JWT_SECRET_KEY || 'web3306@manhthd#@.@#';
const tokenExpireTimeInMs = +process.env.TOKEN_EXPIRE_TIME || 30 * 60 * 1000;
const tokenExpireTimeInSecond = tokenExpireTimeInMs / 1000;

const jobStatuses = {
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
};

export {
  jwtSecretKey,
  tokenExpireTimeInMs,
  tokenExpireTimeInSecond,
  jobStatuses,
};
