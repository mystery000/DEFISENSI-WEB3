import axios from 'axios';

import { API_BASE_URL } from '../config/app';
import { TopNFT, TopERC20Token, TopWallet } from '../types/discover';
import { NFTTransaction, TokenTransaction, TransactionType, WalletTransaction } from '../types/transaction';

import {
  Notification,
  NotificationType,
  NFTNotificationType,
  TokenNotificationType,
  WalletNotificationType,
} from '../types/notification';

import { ExchangesPriceResponse, NFTSaleVolumesResponse, TokenPricesResponse } from '../types/price';
import { BalancesResponse, PortfolioResponse } from '../types/balance';

export const findFollowingWallets = async (address: string, limit: number = 4) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/user/${address}/wallet/transactions?limit=${limit}`);
    return res.data as WalletTransaction[];
  } catch (error) {
    return [];
  }
};

export const findFollowingTokens = async (address: string, limit: number = 4) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/user/${address}/token/transactions?limit=${limit}`);
    return res.data as TokenTransaction[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const findFollowingNFTs = async (address: string, limit: number = 4) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/user/${address}/nft/transactions?limit=${limit}`);
    return res.data as NFTTransaction[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const findWalletTransactions = async (address: string, limit?: number) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/wallet/${address}/transactions?limit=${limit ? limit : 4}`);
    return res.data as WalletTransaction;
  } catch (error) {
    console.error(error);
  }
};

export const getTokenTransactions = async (network: string, address: string, limit: number = 4) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/token/${network}/${address}/transactions?limit=${limit}`);
    return res.data as TokenTransaction[];
  } catch (error) {
    return [];
  }
};

export const getWalletTransactions = async (address: string, limit: number = 4) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/wallet/${address}/transactions?limit=${limit}`);
    return resp.data as WalletTransaction[];
  } catch (error) {
    return [];
  }
};

export const getNFTTransactions = async (network: string, address: string, limit: number = 4) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/nft/${network}/${address}/transactions?limit=${limit}`);
    return res.data as NFTTransaction[];
  } catch (error) {
    return [];
  }
};

export const login = async (address: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/user/login`, { address });
    await axios.post(`${API_BASE_URL}/wallet`, { address });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getPriceFromExchanges = async (network: string, contractAddress: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/token/${network}/${contractAddress}/price/exchanges`);
    return resp.data as ExchangesPriceResponse;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getFollowersByNFT = async (network: string, address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/nft/followers/${network}/${address}`);
    return res.data;
  } catch (error) {
    return [];
  }
};

export const getFollowingsByNFT = async (network: string, address: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/nft/followings/${network}/${address}`);
    return res.data;
  } catch (error) {
    return [];
  }
};

export const getFollowersByWallet = async (address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/wallet/followers/${address}`);
    return resp.data;
  } catch (error) {
    return [];
  }
};

export const getFollowingsByWallet = async (address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/wallet/followings/${address}`);
    return resp.data;
  } catch (error) {
    return [];
  }
};

export const followWallet = async (address: string, walletAddress: string, transactions: WalletTransaction[] = []) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/wallet/follow`, {
      address,
      walletAddress,
      transactions,
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
  transactions: TokenTransaction[] = [],
) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/token/follow`, {
      address,
      tokenAddress,
      network,
      transactions,
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
  transactions: NFTTransaction[] = [],
) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/nft/follow`, {
      address,
      nftAddress,
      network,
      transactions,
    });
    return res.data;
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};

export const createNotification = async (
  type: NotificationType,
  notification: WalletNotificationType | TokenNotificationType | NFTNotificationType,
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
    const res = await axios.get(`${API_BASE_URL}/user/${address}/notifications`);
    return res.data as Notification[];
  } catch (error) {
    throw error;
  }
};

export const updateNotification = async (id: string, notification: Notification) => {
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
  try {
    const resp = await axios.get(`${API_BASE_URL}/token/top-tokens/${network}`);
    return resp.data as TopERC20Token[];
  } catch (error) {
    throw error;
  }
};

export const getTopNFTCollections = async (network: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/nft/top-nfts/${network}`);
    return resp.data as TopNFT[];
  } catch (error) {
    throw error;
  }
};

export const getTopWallets = async (network: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/wallet/top-wallets/${network}`);
    return resp.data as TopWallet[];
  } catch (error) {
    throw error;
  }
};

export const getENS = async (address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/wallet/resolve/${address}/reverse`);
    return resp.data;
  } catch (error) {
    throw error;
  }
};

export const getTokenPrices = async (network: string, address: string, from: string, to: string) => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/token/${network}/${address}/pricing/historical_by_address?from=${from}&to=${to}`,
    );
    return resp.data as TokenPricesResponse;
  } catch (error) {
    throw error;
  }
};

export const getFollowersByToken = async (network: string, address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/token/followers/${network}/${address}`);
    return resp.data;
  } catch (error) {
    return [];
  }
};

export const getFollowingsByToken = async (network: string, address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/token/followings/${network}/${address}`);
    return resp.data;
  } catch (error) {
    return [];
  }
};

export const getTokenBalancesForWalletAddress = async (network: string, address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/wallet/${network}/address/${address}/balances`);
    return resp.data as BalancesResponse;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getHistoricalPortfolioForWalletAddress = async (network: string, address: string, days: number = 1095) => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/wallet/${network}/address/${address}/historical_balances?days=${days}`,
    );
    return resp.data as PortfolioResponse;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getNFTSaleVolumes = async (network: string, address: string) => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/nft/${network}/${address}/sale-volumes`);
    return resp.data as NFTSaleVolumesResponse;
  } catch (error) {
    console.error(error);
  }
};

export const likeTransaction = async (transaction: WalletTransaction, address: string, type: TransactionType) => {
  try {
    if (type === TransactionType.TOKEN) {
      await axios.post(`${API_BASE_URL}/token/like`, {
        address,
        transactionId: transaction.id,
      });
    } else if (type === TransactionType.NFT) {
      await axios.post(`${API_BASE_URL}/nft/like`, {
        address,
        transactionId: transaction.id,
      });
    } else if (type === TransactionType.WALLET) {
      await axios.post(`${API_BASE_URL}/wallet/like`, {
        address,
        transactionId: transaction.id,
      });
    }
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};

export const dislikeTransaction = async (transaction: WalletTransaction, address: string, type: TransactionType) => {
  try {
    if (type === TransactionType.TOKEN) {
      await axios.post(`${API_BASE_URL}/token/dislike`, {
        address,
        transactionId: transaction.id,
      });
    } else if (type === TransactionType.NFT) {
      await axios.post(`${API_BASE_URL}/nft/dislike`, {
        address,
        transactionId: transaction.id,
      });
    } else if (type === TransactionType.WALLET) {
      await axios.post(`${API_BASE_URL}/wallet/dislike`, {
        address,
        transactionId: transaction.id,
      });
    }
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};

export const commentTransaction = async (
  transaction: WalletTransaction,
  address: string,
  content: string,
  type: TransactionType,
) => {
  try {
    if (type === TransactionType.TOKEN) {
      await axios.post(`${API_BASE_URL}/token/comment`, {
        address,
        content,
        transactionId: transaction.id,
      });
    } else if (type === TransactionType.NFT) {
      await axios.post(`${API_BASE_URL}/nft/comment`, {
        address,
        content,
        transactionId: transaction.id,
      });
    } else if (type === TransactionType.WALLET) {
      await axios.post(`${API_BASE_URL}/wallet/comment`, {
        address,
        content,
        transactionId: transaction.id,
      });
    }
  } catch (error) {
    throw new Error((error as any).response.data.message);
  }
};
