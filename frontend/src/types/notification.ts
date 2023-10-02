export enum NotificationType {
  WALLET = 'Wallet',
  TOKEN = 'Token',
  NFT = 'Nft',
}

export type FilterNotification = {
  dir: string;
  value: number;
};

export type WalletNotificationType = {
  address: string;
  name: string;
  network: string[];
  description?: string;
  subscribeTo?: string[];
  receivingFrom?: string[];
  sendingTo?: string[];
  minUsd?: number;
  maxUsd?: number;
  tokens?: string[];
  minTokenValue?: number;
  maxTokenValue?: number;
};

export type TokenNotificationType = {
  address: string;
  name: string;
  network: string[];
  description?: string;
  subscribeTo?: string[];
  minUsd?: number;
  maxUsd?: number;
  tokens?: string[];
  changePercent?: string;
  changePercentDir?: string;
  tokenFilter?: FilterNotification[];
};

export type NFTNotificationType = {
  address: string;
  name: string;
  network: string[];
  description?: string;
  subscribeTo?: string[];
  nftDailyFloor?: FilterNotification[];
  nftDailyVolume?: FilterNotification[];
  nftDailySales?: FilterNotification[];
};

export type Notification = WalletNotificationType &
  TokenNotificationType &
  NFTNotificationType & { type: string; status: boolean; _id: string };
