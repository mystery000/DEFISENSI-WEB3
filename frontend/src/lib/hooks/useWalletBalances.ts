import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BalancesResponse } from '../../types/balance';
import { getTokenBalancesForWalletAddress } from '../api';

export default function useWalletBalances(network: string) {
  const { address } = useParams();
  const [data, setData] = useState<BalancesResponse>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!address) return;
      try {
        setLoading(true);
        const balances = await getTokenBalancesForWalletAddress(network, address);
        setData(balances);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      }
    })();
  }, [network, address]);

  return { balances: data, error, loading, mutate: setData };
}
