export interface TokenBalance {
  decimals: Number;
  logo: string;
  name: string;
  symbol: string;
  balance: string;
  usd: string;
}

export type BalanceHistory = {
  ethereum?: [
    {
      date: number;
      tokens: [TokenBalance];
    }
  ];
  polygon?: [
    {
      date: number;
      tokens: [TokenBalance];
    }
  ];
  binance?: [
    {
      date: number;
      tokens: [TokenBalance];
    }
  ];
};

export type Balance = {
  ethereum?: {
    date: number;
    tokens: [TokenBalance];
  };
  polygon?: {
    date: number;
    tokens: [TokenBalance];
  };
  binance?: {
    date: number;
    tokens: [TokenBalance];
  };
};
