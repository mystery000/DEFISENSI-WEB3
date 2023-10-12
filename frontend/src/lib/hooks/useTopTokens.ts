import { useEffect, useState } from 'react';

import { getTopERC20Tokens } from '../api';
import { TopERC20Token } from '../../types/discover';

export default function useTopTokens(network: string) {
  const [data, setData] = useState<TopERC20Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const topTokens = await getTopERC20Tokens(network);
        setData(topTokens);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        setError(error);
      }
    })();
  }, [network]);

  return { data, error, loading, mutate: setData };
}
