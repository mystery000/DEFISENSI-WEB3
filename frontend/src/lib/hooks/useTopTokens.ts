import { useEffect, useState } from 'react';

import { getTopERC20Tokens } from '../api';
import { TopToken } from '../../types/token';

export default function useTopTokens() {
  const [data, setData] = useState<TopToken[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const topTokens = await getTopERC20Tokens();
        console.log(topTokens);
        setData(topTokens);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
        return [];
      }
    })();
  }, []);

  return { data, error, loading, mutate: setData };
}
