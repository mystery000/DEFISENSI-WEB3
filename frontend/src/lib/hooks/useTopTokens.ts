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
        {
          id: 'matic-network',
          symbol: 'matic',
          name: 'Polygon',
          image:
            'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
          current_price: 0.521119,
          price_change_24h: -0.007289565445187219,
          price_change_percentage_24h: -1.37953,
          followers: 0,
        },
        {
          id: 'liquity',
          symbol: 'lqty',
          name: 'Liquity',
          image:
            'https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663',
          current_price: 0.850409,
          price_change_24h: 0.02131266,
          price_change_percentage_24h: 2.57059,
          followers: 0,
        },
      ];
      setData(topTokens);
      setLoading(false);
    })();
  }, [network]);

  return { data, loading, mutate: setData };
}
