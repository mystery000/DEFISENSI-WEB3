export interface TokenBalance {
  logo?: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  value: string;
  usdPrice: string;
}

export type Balance = {
  ethereum?: {
    timestamp: number;
    tokens: [TokenBalance];
  };
  polygon?: {
    timestamp: number;
    tokens: [TokenBalance];
  };
  binance?: {
    timestamp: number;
    tokens: [TokenBalance];
  };
};

export type BalanceHistory = {
  ethereum?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    }
  ];
  polygon?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    }
  ];
  binance?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    }
  ];
};
