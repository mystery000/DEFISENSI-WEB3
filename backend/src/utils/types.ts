import { NetworkType } from './enums/network.enum';
import { TransactionType } from './enums/transaction.enum';

export type BalancesResponse = {
  /** * The contract logo URL. */
  logo_url: string;
  /** * Use contract decimals to format the token balance for display purposes - divide the balance by `10^{contract_decimals}`. */
  contract_decimals: number;
  /** * The string returned by the `name()` method. */
  contract_name: string;
  /** * The ticker symbol for this contract. This field is set by a developer and non-unique across a network. */
  contract_ticker_symbol: string;
  /** * Use the relevant `contract_address` to lookup prices, logos, token transfers, etc. */
  contract_address: string;
  /** * The asset balance. Use `contract_decimals` to scale this balance for display purposes. */
  balance: string;
  /** * The current balance converted to fiat in `quote-currency`. */
  quote: string;
  /** * A prettier version of the quote for rendering purposes. */
  pretty_quote: string;
  /** * One of `cryptocurrency`, `stablecoin`, `nft` or `dust`. */
  type: string;
}[];

export type PortfolioResponse = {
  timestamp: string;
  /** * The current total balance converted to fiat in `quote-currency`. */
  total_quote: string;
  /** * A prettier version of the total quote for rendering purposes. */
  pretty_total_quote: string;
}[];

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
  collection: string;
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

// Normal Token Transcation Type Definition (ERC-20, BEP-20)
export type Token = {
  name: string;
  symbol: string;
  logo?: string;
  contractAddress: string;
  decimals: string;
  amount: string;
  price: string;
};

export type TokenTransaction = {
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
};

// NFT Transcation Type Definition
export type ActionType = 'Burn' | 'Transfer' | 'Sale' | 'Mint' | 'Purchase';

export type Action = {
  type: ActionType;
  amount: number;
  tokenAddress: string;
  name: string;
  symbol: string;
  floor?: string;
};

export type NFTTransaction = {
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

export type TopERC20Token = {
  address: string;
  name: string;
  price: string;
  change: string;
  followers?: number;
};

export type TopNFT = {
  address: string;
  name: string;
  floor: string;
  volume: string;
  change: string;
  holders: string;
};

export type TopWallet = { address: string; balance: string; percentage: string; followers?: number };
