import { NetworkType } from '.';

export enum TransactionType {
  TOKEN = 'token',
  NFT = 'nft',
}

export type Token = {
  name: string;
  symbol: string;
  logo?: string;
  decimals: string;
  contractAddress: string;
  value: string;
  usdPrice: string;
};

export type Transaction = {
  // Extended fields
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];

  txhash: string;
  blockNumber: string;
  type: TransactionType;
  details: {
    from: string;
    to: string;
    token0: Token;
    token1?: Token;
    timestamp: number;
  };
};

export type WalletTransaction = {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];
  transactions: Transaction[];
};

export type TokenTransaction = {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];
  transactions: Transaction[];
};
