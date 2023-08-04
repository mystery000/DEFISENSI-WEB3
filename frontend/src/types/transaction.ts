import { TransactionType } from "./enums";

export interface Transaction {
  txhash: string;
  blockNumber: string;
  details: {
    from: string;
    to: string;
    type: TransactionType;
    created: number;
    token0: {
      symbol: string;
      address: string;
      amount: number;
      decimals: number;
      price: number;
    };
    token1?: {
      symbol: string;
      address: string;
      amount: number;
      decimals: number;
      price: number;
    };
  };
}

export type Wallet = {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];
  transactions: Transaction[];
};

export type Token = {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];
  transactions: Transaction[];
};
