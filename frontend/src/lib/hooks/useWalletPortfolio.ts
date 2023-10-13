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
import { NetworkType } from '../../types';

export type WalletPortfolio = {
  followers: any[];
  followings: any[];
  ens?: string;
  historicalBalances?: {
    ethereum: PortfolioResponse;
    polygon: PortfolioResponse;
    binance: PortfolioResponse;
    arbitrum: PortfolioResponse;
    avalanche: PortfolioResponse;
  };
  transactions: any[];
};

export default function useWalletPortfolio() {
  const { address } = useParams();

  const [data, setData] = useState<WalletPortfolio>({
    followers: [],
    followings: [],
    transactions: [],
  });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  return { data, error, loading, mutate: setData };
}
