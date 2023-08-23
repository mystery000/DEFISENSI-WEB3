import axios from 'axios';

import { ExchangePrice, HistoricalPrice } from '../types/price';
import { API_BASE_URL } from '../config/app';
import { Balance, BalanceHistory } from '../types/balance';
import { TokenTransaction, WalletTransaction } from '../types/transaction';

export const findFollowingWallets = async (
  address: string,
  limit: number = 4,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/wallet/transactions?limit=${limit}`,
    );
    return res.data as WalletTransaction[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const findFollowingTokens = async (
  address: string,
  limit: number = 4,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/token/transactions?limit=${limit}`,
    );
    return res.data as TokenTransaction[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const findWalletTransactions = async (
  address: string,
  limit?: number,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/wallet/${address}/transactions?limit=${
        limit ? limit : 4
      }`,
    );
    return res.data as WalletTransaction;
  } catch (error) {
    console.log(error);
  }
};

export const getTokenTransactions = async (
  network: string,
  address: string,
  limit?: number,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/${network}/${address}/transactions?limit=${
        limit ? limit : 4
      }`,
    );
    return res.data as TokenTransaction;
  } catch (error) {
    console.log(error);
  }
};

export const getBalance = async (address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/${address}/balance`);
    return res.data as Balance;
  } catch (error) {
    console.log(error);
  }
};

export const getBalanceHistory = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/wallet/${address}/balancehistory`,
    );
    return res.data as BalanceHistory;
  } catch (error) {
    console.log(error);
  }
};

export const findUserByAddress = async (address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/user/${address}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getPriceHistory = async (
  network: string,
  contractAddress: string,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/${network}/${contractAddress}/price/history`,
    );
    return res.data as HistoricalPrice[];
  } catch (error) {
    console.log(error);
    return [] as HistoricalPrice[];
  }
};

export const getPriceFromExchanges = async (
  network: string,
  contractAddress: string,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/${network}/${contractAddress}/price/exchanges`,
    );
    return res.data as ExchangePrice;
  } catch (error) {
    console.log(error);
    return;
  }
};
