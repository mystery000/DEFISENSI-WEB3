import { useEffect, useState } from 'react';

import { NetworkType } from '../../types';
import { getTopERC20Tokens } from '../api';
import { TopToken } from '../../types/discover';

export default function useTopTokens(network: NetworkType) {
  const [data, setData] = useState<TopToken[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const topTokens = await getTopERC20Tokens(network);
      setData(topTokens);
      setLoading(false);
    })();
  }, [network]);

  return { data, loading, mutate: setData };
}
