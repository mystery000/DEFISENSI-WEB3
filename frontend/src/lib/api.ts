import axios from "axios";

import { API_BASE_URL } from "../config/app";
import { Token, Transaction, Wallet } from "../types/transaction";
import { TokenBalance } from "../types/balance";

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

export const GetTokenBalances = async (address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/${address}/balances`);
    return res.data as TokenBalance[];
  } catch (error) {
    console.log(error);
  }
};
