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

export type TokenPricesResponse = {
  /** * Use contract decimals to format the token balance for display purposes - divide the balance by `10^{contract_decimals}`. */
  contract_decimals: number;
  /** * The string returned by the `name()` method. */
  contract_name: string;
  /** * The ticker symbol for this contract. This field is set by a developer and non-unique across a network. */
  contract_ticker_symbol: string;
  /** * Use the relevant `contract_address` to lookup prices, logos, token transfers, etc. */
  contract_address: string;
  /** * The contract logo URL. */
  logo_url: string;
  /** * The requested quote currency eg: `USD`. */
  quote_currency: string;
  /** * List of response items. */
  prices: {
    /** * The date of the price capture. */
    date: Date;
    /** * The price in the requested `quote-currency`. */
    price: number;
    /** * A prettier version of the price for rendering purposes. */
    pretty_price: string;
  }[];
};

export type NFTSaleVolumesResponse = {
  name: string;
  address: string;
  network: string;
  volume: string;
  sales: number;
  holders: number;
  floor_price: number;
  floor_price_symbol: string;
  sale_volumes: {
    date: string;
    volume: number;
  }[];
};
