import { NetworkType } from '.';

export enum NotificationType {
  WALLET = 'Wallet',
  TOKEN = 'Token',
  NFT = 'Nft',
}

export type FilterNotification = {
  dir: string;
  value: number;
};

export type CreateWalletNotification = {
  address: string;
  name: string;
  description: string;
  subscribeTo: string[];
  receivingFrom: string[];
  sendingTo: string[];
  minUsd: number;
  maxUsd: number;
  tokens: string[];
  minTokenValue: number;
  maxTokenValue: number;
  network: string[];
};

export type CreateTokenNotification = {
  address: string;
  name: string;
  description: string;
  subscribeTo: string[];
  minUsd: number;
  maxUsd: number;
  tokens: string[];
  changePercent: string;
  changePercentDir: string;
  tokenFilter: FilterNotification[];
  network: string[];
};

export type CreateNFTNotification = {
  address: string;
  name: string;
  description: string;
  subscribeTo: string[];
  nftDailyFloor: FilterNotification[];
  nftDailyVolume: FilterNotification[];
  nftDailySales: FilterNotification[];
  network: string[];
};

export type Notification = {
  type: NotificationType;
  status: boolean;
  name: string;
  description: string;
  subscribeTo: string[];
  receivingFrom: string[];
  sendingTo: string;
  minUsd: number;
  maxUsd: number;
  tokens: string;
  minTokenValue: number;
  maxTokenValue: number;
  changePercent: string;
  changePercentDir: string;
  tokenFilter: { dir: String; value: Number }[];
  nftDailyFloor: { dir: String; value: Number }[];
  nftDailyVolume: { dir: String; value: Number }[];
  nftDailySales: { dir: String; value: Number }[];
  network: NetworkType[];
};
