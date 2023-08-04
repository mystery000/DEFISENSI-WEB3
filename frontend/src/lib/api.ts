import axios from "axios";

import { Balance, BalanceHistory } from "../types/balance";
import { API_BASE_URL } from "../config/app";
import { Token, Wallet } from "../types/transaction";

export const findFollowingWallets = async (address: string, limit: number) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/wallet/transactions/${limit}`
    );
    return res.data as Wallet[];
  } catch (error) {
    console.log(error);
  }
};

export const findFollowingTokens = async (address: string, limit: number) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/token/transactions/${limit}`
    );
    return res.data as Token[];
  } catch (error) {
    console.log(error);
  }
};

export const findWalletTransactions = async (
  address: string,
  limit: number
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/wallet/${address}/transactions/${limit}`
    );
    return res.data as Wallet;
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
      `${API_BASE_URL}/wallet/${address}/balancehistory`
    );
    return res.data as BalanceHistory;
  } catch (error) {
    console.log(error);
  }
};
