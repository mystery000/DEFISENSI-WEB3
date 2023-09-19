export type TopToken = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  followers?: number;
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
