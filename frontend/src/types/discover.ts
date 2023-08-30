export type TopToken = {
  rank: string;
  token_name: string;
  token_symbol: string;
  token_logo: string;
  contract_address: string;
  price_usd: string;
  price_24h_percent_change: string;
  price_7d_percent_change: string;
  followers: number;
};

export type TopNFT = {
  rank: string;
  collection_title: string;
  floor_price_usd: string;
  floor_price_24hr_percent_change: string;
  market_cap_usd: string;
  market_cap_24hr_percent_change: string;
  volume_usd: string;
  volume_24hr_percent_change: string;
  holders: number;
};

export type TopWallet = {
  address: string;
  amount: string;
  price_usd: string;
  price_24h_percent_change: string;
  followers: number;
};
