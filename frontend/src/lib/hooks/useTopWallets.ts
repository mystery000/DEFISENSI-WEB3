import { useEffect, useState } from 'react';

import { getTopWallets } from '../api';
import { TopWallet } from '../../types/discover';

export default function useTopWallets(network: string) {
  const [data, setData] = useState<TopWallet[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const topTokens = await getTopWallets(network);
        setData(topTokens);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
      }
    })();
  }, [network]);

  return { data, error, loading, mutate: setData };
}
