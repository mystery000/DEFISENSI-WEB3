import axios from 'axios';

import { API_BASE_URL } from '../config/app';
import { Balance, BalanceHistory } from '../types/balance';
import { ExchangePrice, HistoricalPrice } from '../types/price';
import { TopNFT, TopToken, TopWallet } from '../types/discover';
import {
  NFTTransaction,
  TokenTransaction,
  WalletTransaction,
} from '../types/transaction';

import {
  NFTNotificationType,
  Notification,
  NotificationType,
  TokenNotificationType,
  WalletNotificationType,
} from '../types/notification';

export const findFollowingWallets = async (
  address: string,
  limit: number = 4,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/wallet/transactions?limit=${limit}`,
    );
    return res.data as WalletTransaction[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const findFollowingTokens = async (
  address: string,
  limit: number = 4,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/token/transactions?limit=${limit}`,
    );
    return res.data as TokenTransaction[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const findFollowingNFTs = async (address: string, limit: number = 4) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/nft/transactions?limit=${limit}`,
    );
    return res.data as NFTTransaction[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const findWalletTransactions = async (
  address: string,
  limit?: number,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/wallet/${address}/transactions?limit=${
        limit ? limit : 4
      }`,
    );
    return res.data as WalletTransaction;
  } catch (error) {
    console.log(error);
  }
};

export const getTokenTransactions = async (
  network: string,
  address: string,
  limit?: number,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/${network}/${address}/transactions?limit=${
        limit ? limit : 4
      }`,
    );
    return res.data as TokenTransaction;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getNFTTransactions = async (
  network: string,
  address: string,
  limit?: number,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/nft/${network}/${address}/transactions?limit=${
        limit ? limit : 4
      }`,
    );
    return res.data as NFTTransaction;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getBalance = async (address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/${address}/balance`);
    return res.data as Balance;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getBalanceHistory = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/wallet/${address}/balancehistory`,
    );
    return res.data as BalanceHistory;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const login = async (address: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/user/login`, { address });
    await axios.post(`${API_BASE_URL}/wallet`, { address });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getPriceHistory = async (
  network: string,
  contractAddress: string,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/${network}/${contractAddress}/price/history`,
    );
    return res.data as HistoricalPrice[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getPriceFromExchanges = async (
  network: string,
  contractAddress: string,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/${network}/${contractAddress}/price/exchanges`,
    );
    return res.data as ExchangePrice;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getFollowersByToken = async (network: string, address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/followers/${network}/${address}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getFollowingsByToken = async (
  network: string,
  address: string,
) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/token/followings/${network}/${address}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getFollowersByNFT = async (network: string, address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/nft/followers/${network}/${address}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getFollowingsByNFT = async (network: string, address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/nft/followings/${network}/${address}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getFollowersByWallet = async (address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/followers/${address}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getFollowingsByWallet = async (address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/followings/${address}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const followWallet = async (address: string, walletAddress: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/wallet/follow`, {
      address,
      walletAddress,
    });
    return res.data;
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};

export const followToken = async (
  address: string,
  tokenAddress: string,
  network: string,
) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/token/follow`, {
      address,
      tokenAddress,
      network,
    });
    return res.data;
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};

export const followNFT = async (
  address: string,
  nftAddress: string,
  network: string,
) => {
  console.log(network);
  try {
    const res = await axios.post(`${API_BASE_URL}/nft/follow`, {
      address,
      nftAddress,
      network,
    });
    return res.data;
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};

export const createNotification = async (
  type: NotificationType,
  notification:
    | WalletNotificationType
    | TokenNotificationType
    | NFTNotificationType,
) => {
  try {
    if (type === NotificationType.WALLET) {
      const res = await axios.post(`${API_BASE_URL}/notification/wallet`, {
        ...notification,
      });
      return res.data as Notification;
    } else if (type === NotificationType.TOKEN) {
      const res = await axios.post(`${API_BASE_URL}/notification/token`, {
        ...notification,
      });
      return res.data as Notification;
    } else if (type === NotificationType.NFT) {
      const res = await axios.post(`${API_BASE_URL}/notification/nft`, {
        ...notification,
      });
      return res.data as Notification;
    }
    throw new Error('The type of notification to be created is not supported');
  } catch (error) {
    throw error;
  }
};

export const getNotifications = async (address: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/user/${address}/notifications`,
    );
    return res.data as Notification[];
  } catch (error) {
    throw error;
  }
};

export const updateNotification = async (
  id: string,
  notification: Notification,
) => {
  try {
    const res = await axios.patch(`${API_BASE_URL}/notification/${id}`, {
      ...notification,
    });
    return res.data as Notification;
  } catch (error) {
    throw error;
  }
};

export const getTopERC20Tokens = async (network: string) => {
  if (!network) {
    console.log('network parameter is required to get the top tokens');
    return [];
  }
  try {
    const res = await axios.get(`${API_BASE_URL}/token/top/${network}`);
    return res.data as TopToken[];
  } catch (error) {
    return [];
  }
};

export const getTopNFTCollections = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/nft/top-nfts`);
    return res.data as TopNFT[];
  } catch (error) {
    throw error;
  }
};

export const getTopWallets = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/top-wallets`);
    return res.data as TopWallet[];
  } catch (error) {
    throw error;
  }
};

export const getENS = async (address: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/wallet/resolve/${address}/reverse`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return '';
  }
};

export const getTokenAddress = async (network: string, id: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/token/top/${network}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
