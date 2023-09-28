import { useEffect, useState } from 'react';

import { TopNFT } from '../../types/discover';
import { getTopNFTCollections } from '../api';

export default function useTopNFTs(network: string) {
  const [data, setData] = useState<TopNFT[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const topNFTs = await getTopNFTCollections(network);
        setData(topNFTs);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
        return [];
      }
    })();
  }, [network]);

  return { data, error, loading, mutate: setData };
}
