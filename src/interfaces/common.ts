export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type TwoDigitCode = `${Digit}${Digit}`;
export type FourDigitCode = `${TwoDigitCode}${TwoDigitCode}`;
export type SixDigitCode = string;
export type EightDigitCode = string;

export type BinaryDigit = '0' | '1';
export type PermissionBits = `${BinaryDigit}${BinaryDigit}${BinaryDigit}${BinaryDigit}`;

export type EpochTimeInMs = number;
