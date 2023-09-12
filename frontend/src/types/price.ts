export type HistoricalPrice = {
  price: number;
  symbol: string;
  decimals: number;
  updated_at: string;
};

export type ExchangePrice = {
  tokenName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenLogo: string;
  tokenDecimals: string;
  usdPrice: {
    uniswap?: string;
    kucoin?: string;
    binance?: string;
    coinbase?: string;
  };
};
