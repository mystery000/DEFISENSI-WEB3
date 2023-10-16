import { NetworkType } from '.';

export enum TransactionType {
  TOKEN = 'token',
  NFT = 'nft',
}

export type Token = {
  name: string;
  symbol: string;
  logo?: string;
  contractAddress: string;
  decimals: string;
  amount: string;
  price: string;
};

export interface Transaction {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];

  txHash: string;
  blockNumber: string;
  type: TransactionType;
  network: NetworkType;
  timestamp: number;
  details: {
    from: string;
    to: string;
    token0: Token;
    token1?: Token;
  };
}

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

export type NFTTransaction = {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];
  transactions: NftTransfer[];
};

export type NftTransfer = {
  // Extended fields
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];

  txHash: string;
  blockNumber: string;
  type: TransactionType;
  network: NetworkType;
  timestamp: number;
  details: {
    from: string;
    to: string;
    actions: Action[];
  };
};
export type ActionType = 'Burn' | 'Transfer' | 'Sale' | 'Mint' | 'Purchase';

export type Action = {
  type: ActionType;
  amount: number;
  tokenAddress: string;
  name: string;
  symbol: string;
  floor?: string;
};
