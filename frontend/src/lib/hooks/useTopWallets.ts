import { useEffect, useState } from 'react';
import { TopWallet } from '../../types/discover';
import { getTopWallets } from '../api';

export default function useTopWallets() {
  const [data, setData] = useState<TopWallet[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const topTokens = await getTopWallets();
        setData(topTokens);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
      }
    })();
  }, []);
  return { data, error, loading, mutate: setData };
}
