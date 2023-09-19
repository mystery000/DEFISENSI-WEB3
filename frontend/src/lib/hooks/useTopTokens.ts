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
      // const topTokens = await getTopERC20Tokens(network);
      const topTokens = [
        {
          id: 'tether',
          symbol: 'usdt',
          name: 'Tether',
          image:
            'https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663',
          current_price: 1,
          price_change_24h: -0.000421698960272332,
          price_change_percentage_24h: -0.04213,
          followers: 0,
        },
      ];
      setData(topTokens);
      setLoading(false);
    })();
  }, [network]);

  return { data, loading, mutate: setData };
}
