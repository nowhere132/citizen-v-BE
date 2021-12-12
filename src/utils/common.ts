/* eslint-disable implicit-arrow-linebreak */
const randomInt = (leftBound: number, rightBound: number) =>
  leftBound + Math.floor(Math.random() * (rightBound - leftBound + 1));

const loopFixedTimes = (num: number) => (f: Function) => {
  if (num > 0) {
    f();
    loopFixedTimes(num - 1)(f);
  }
};

export {
  randomInt,
  loopFixedTimes,
};
