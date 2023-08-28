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

export type TokenNotificationType = {
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

export type NFTNotificationType = {
  address: string;
  name: string;
  description: string;
  subscribeTo: string[];
  nftDailyFloor: FilterNotification[];
  nftDailyVolume: FilterNotification[];
  nftDailySales: FilterNotification[];
  network: string[];
};

export type Notification = WalletNotificationType &
  TokenNotificationType &
  NFTNotificationType & { type: string; status: boolean };
