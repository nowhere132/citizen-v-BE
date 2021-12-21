import { randomBytes } from 'crypto';

/* eslint-disable implicit-arrow-linebreak */
const randomInt = (leftBound: number, rightBound: number) =>
  leftBound + Math.floor(Math.random() * (rightBound - leftBound + 1));

const randomElemInArr = (arr: any[]) =>
  arr[randomInt(0, arr.length - 1)];

const randomDate = (from: Date, to: Date): Date => {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
};

const randomUuid = () =>
  [4, 2, 2, 2, 6] // to 8-4-4-4-12 in hex
    .map((group) => randomBytes(group).toString('hex'))
    .join('-');

const loopFixedTimes = (num: number) => (f: Function) => {
  if (num > 0) {
    f();
    loopFixedTimes(num - 1)(f);
  }
};

const loopFixedTimesAsync = (num: number) => async (f: () => Promise<any>) => {
  if (num > 0) {
    await f();
    loopFixedTimesAsync(num - 1)(f);
  }
};

export {
  randomInt,
  randomElemInArr,
  randomDate,
  randomUuid,
  loopFixedTimes,
  loopFixedTimesAsync,
};
