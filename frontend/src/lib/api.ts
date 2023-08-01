import axios from "axios";

import { API_BASE_URL } from "../config/app";
import { Token, Wallet } from "../types/transaction";

export const findWalletTransactions = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/wallet/transactions`
    );
    return res.data as Wallet[];
  } catch (error) {
    console.log(error);
  }
};

export const findTokenTransactions = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/token/transactions`
    );
    return res.data as Token[];
  } catch (error) {
    console.log(error);
  }
};
