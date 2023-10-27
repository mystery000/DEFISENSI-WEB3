import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PortfolioResponse } from '../../types/balance';
import {
  getENS,
  getFollowersByWallet,
  getWalletTransactions,
  getFollowingsByWallet,
  getHistoricalPortfolioForWalletAddress,
} from '../api';

import { NetworkType } from '../../types';
import { WalletTransaction } from '../../types/transaction';

export type WalletPortfolio = {
  followers: { address: string }[];
  followings: { address: string }[];
  ens?: string;
  historicalBalances?: {
    ethereum: PortfolioResponse;
    polygon: PortfolioResponse;
    binance: PortfolioResponse;
    arbitrum: PortfolioResponse;
    avalanche: PortfolioResponse;
  };
  transactions: WalletTransaction[];
};

export default function useWalletPortfolio(network: string) {
  const { address } = useParams();

  const [data, setData] = useState<WalletPortfolio>({
    followers: [],
    followings: [],
    transactions: [],
  });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTxns, setLoadingTxns] = useState(false);

  useEffect(() => {
    (async () => {
      if (!address) return;
      try {
        setLoading(true);
        const [followers, followings, ens, ethereum, polygon, arbitrum, avalanche, binance] = await Promise.all([
          getFollowersByWallet(address),
          getFollowingsByWallet(address),
          getENS(address),
          getHistoricalPortfolioForWalletAddress(NetworkType.ETHEREUM, address),
          getHistoricalPortfolioForWalletAddress(NetworkType.POLYGON, address),
          getHistoricalPortfolioForWalletAddress(NetworkType.ARBITRUM, address),
          getHistoricalPortfolioForWalletAddress(NetworkType.AVALANCHE, address),
          getHistoricalPortfolioForWalletAddress(NetworkType.BSC, address),
        ]);

        setData({
          followers,
          followings,
          ens: ens,
          historicalBalances: {
            ethereum,
            polygon,
            arbitrum,
            avalanche,
            binance,
          },
          transactions: [],
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        setError(error);
      }
    })();
  }, [address]);

  useEffect(() => {
    (async () => {
      if (!address) return;
      try {
        setLoadingTxns(true);
        const [txns] = await Promise.all([getWalletTransactions(address, network)]);
        setData((prev) => ({ ...prev, transactions: txns }));
        setLoadingTxns(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoadingTxns(false);
      }
    })();
  }, [address, network]);

  return { data, error, loading: loading || loadingTxns, mutate: setData };
}
