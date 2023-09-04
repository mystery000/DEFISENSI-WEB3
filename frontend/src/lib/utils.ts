import moment from 'moment';
import { TransferType } from '../types';
import { Transaction } from '../types/transaction';

export const getAge = (timestamp: number) => {
  const now = moment();
  const then = moment(timestamp);
  const duration = moment.duration(now.diff(then));

  const age = {
    years: duration.years(),
    months: duration.months(),
    days: duration.days(),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };

  let formattedAge = '';
  let count = 0;
  const precise = 2;
  // Get and print both keys and values
  Object.entries(age).forEach(([key, value]) => {
    if (count >= precise) return;
    if (value > 0) {
      formattedAge += `${value} ${key} `;
      count += 1;
    }
  });

  return formattedAge.length > 0 ? formattedAge : 'Just now';
};

export const getTransferType = (tx: Transaction) => {
  // SWAP transaction
  if (tx.details.token1) {
    return TransferType.SWAP;
  }
  // Normal transaction
  if (!tx.details.token1) {
    return TransferType.SEND;
  }
};

export const standardUnit = (count: number) => {
  const score: number = count / 1000;
  return score > 1 ? `${score}K` : `${count}`;
};

export const convertHex = (hex: string) => {
  return parseInt(hex, 16).toString(16);
};

export const convertDecimals = (value: string, decimals: string) => {
  return (Number(value) / 10 ** Number(decimals)).toFixed(2);
};

export const balanceFormatter = (balance: number) => {
  if (balance >= 1e9) {
    return (balance / 1e9).toFixed(2) + 'B';
  } else if (balance >= 1e6) {
    return (balance / 1e6).toFixed(2) + 'M';
  } else if (balance >= 1e3) {
    return (balance / 1e3).toFixed(2) + 'K';
  } else {
    return balance.toFixed(2);
  }
};

export const isValid = (value: any) => {
  if (value === null || value === undefined) return false;

  // Check for strings; if empty or just whitespace, return false.
  if (typeof value === 'string' && value.trim() === '') return false;

  // Check for arrays; if empty, return false.
  if (Array.isArray(value) && value.length === 0) return false;

  // If value is an object, recursively check its properties.
  if (typeof value === 'object') {
    for (let key in value) {
      if (!isValid(value[key])) return false;
    }
  }

  return true;
};
