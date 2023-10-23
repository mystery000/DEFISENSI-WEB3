import { NetworkType } from '.';

export enum TransactionType {
  TOKEN = 'token',
  NFT = 'nft',
  WALLET = 'wallet',
}

export type Feedback = {
  likes: string[];
  dislikes: string[];
  comments: {
    address: string;
    comment: string;
  }[];
};

export type Token = {
  name: string;
  symbol: string;
  logo?: string;
  contractAddress: string;
  decimals: string;
  amount: string;
  price: string;
};

// ERC20 Transaction Type
export type TokenTransaction = {
  id: string;
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
} & Feedback;

export type ActionType = 'Burn' | 'Transfer' | 'Sale' | 'Mint' | 'Purchase';

export type Action = {
  type: ActionType;
  amount: number;
  tokenAddress: string;
  name: string;
  symbol: string;
  floor?: string;
};

// ERC721 & ERC1155 Transaction Type
export type NFTTransaction = {
  id: string;
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
} & Feedback;

export type WalletTransaction = TokenTransaction | NFTTransaction;
