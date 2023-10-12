import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BalancesResponse, PortfolioResponse } from '../../types/balance';
import {
  getFollowersByWallet,
  getFollowingsByWallet,
  getENS,
  getTokenBalancesForWalletAddress,
  getHistoricalPortfolioForWalletAddress,
} from '../api';

export type WalletPortfolio = {
  followers: any[];
  followings: any[];
  ens?: string;
  balances: BalancesResponse;
  historicalBalances: PortfolioResponse;
  transactions: any[];
};

export default function useWalletPortfolio(network: string) {
  const { address } = useParams();

  const [data, setData] = useState<WalletPortfolio>({
    followers: [],
    followings: [],
    balances: [],
    historicalBalances: [],
    transactions: [],
  });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!address || !network) return;
      try {
        setLoading(true);
        const [followers, followings, ens, balances, historicalBalances] = await Promise.all([
          getFollowersByWallet(address),
          getFollowingsByWallet(address),
          getENS(address),
          getTokenBalancesForWalletAddress(network, address),
          getHistoricalPortfolioForWalletAddress(network, address),
        ]);
        setData({
          followers,
          followings,
          ens: ens,
          balances,
          historicalBalances,
          transactions: [],
        });
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        setError(error);
      }
    })();
  }, [address, network]);

  return { data, error, loading, mutate: setData };
}
