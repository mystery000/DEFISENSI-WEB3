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

export type TopWallet = {
  address: string;
  balance: string;
  percentage: string;
  followers?: number;
};
