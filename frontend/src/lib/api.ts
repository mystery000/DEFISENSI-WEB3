import axios from "axios";

import { API_BASE_URL } from "../config/app";
import { Token, Transaction, Wallet } from "../types/transaction";

export const findFollowingWallets = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/wallet/transactions`
    );
    return res.data as Wallet[];
  } catch (error) {
    console.log(error);
  }
};

export const findFollowingTokens = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/token/transactions`
    );
    return res.data as Token[];
  } catch (error) {
    console.log(error);
  }
};

export const findWalletTransactions = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/wallet/transactions/${address}`
    );
    return res.data as Wallet;
  } catch (error) {
    console.log(error);
  }
};
