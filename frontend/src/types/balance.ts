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
