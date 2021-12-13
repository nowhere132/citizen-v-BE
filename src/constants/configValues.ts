const jwtSecretKey = process.env.JWT_SECRET_KEY || 'web3306@manhthd#@.@#';
const tokenExpireTimeInMs = +process.env.TOKEN_EXPIRE_TIME || 5 * 60 * 1000;

const jobStatuses = {
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
};

export {
  jwtSecretKey,
  tokenExpireTimeInMs,
  jobStatuses,
};
