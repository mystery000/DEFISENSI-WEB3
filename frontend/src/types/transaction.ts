export interface Transaction {
  txhash: string;
  blockNumber: string;
  details: {
    from: string;
    to: string;
    timestamp: number;
    token0: {
      contractAddress: string;
      symbol: string;
      decimals: number;
      amount: number;
      usd: number;
    };
    token1?: {
      contractAddress: string;
      symbol: string;
      decimals: number;
      amount: number;
      usd: number;
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
