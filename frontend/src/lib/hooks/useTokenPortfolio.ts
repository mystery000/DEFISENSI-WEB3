import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getFollowersByToken, getFollowingsByToken, getTokenPrices, getTokenTransactions } from '../api';
import moment from 'moment';
import { TokenTransaction, Transaction } from '../../types/transaction';
import { TokenPricesResponse } from '../../types/price';

export type TokenPortfolio = {
  followers: string[];
  followings: string[];
  tokenPrices: TokenPricesResponse | null;
  transactions?: TokenTransaction;
};

// Get the followers and followings of this token
export default function useTokenPortfolio() {
  const { network, address } = useParams();
  const [data, setData] = useState<TokenPortfolio>({
    followers: [],
    followings: [],
    tokenPrices: null,
  });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!network || !address) return;

      try {
        setLoading(true);
        const from = moment().format('YYYY-MM-DD');
        const to = moment().subtract(3, 'years').format('YYYY-MM-DD');

        const [followers, followings, tokenPrices, transactions] = await Promise.all([
          getFollowersByToken(network, address),
          getFollowingsByToken(network, address),
          getTokenPrices(network, address, from, to),
          getTokenTransactions(network, address),
        ]);

        setData({
          followers: followers || [],
          followings: followings || [],
          tokenPrices: tokenPrices,
          transactions,
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        setError(error);
      }
    })();
  }, [network, address]);

  return { portfolio: data, error, loading, mutate: setData };
}
