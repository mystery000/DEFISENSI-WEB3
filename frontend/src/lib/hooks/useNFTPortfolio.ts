import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { NFTTransaction } from '../../types/transaction';
import { NFTSaleVolumesResponse } from '../../types/price';
import { getFollowersByNFT, getFollowingsByNFT, getNFTSaleVolumes, getNFTTransactions } from '../api';

export type NFTPortfolio = {
  followers: { address: string }[];
  followings: { address: string }[];
  stats?: NFTSaleVolumesResponse;
  transactions: NFTTransaction[];
};

// Get the followers and followings of this token
export default function useNFTPortfolio() {
  const [data, setData] = useState<NFTPortfolio>({ followers: [], followings: [], transactions: [] });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { network, address } = useParams();

  useEffect(() => {
    (async () => {
      if (!network || !address) {
        setError('network or address is missing now');
        return;
      }
      setLoading(true);
      try {
        const [followers, followings, stats, transactions] = await Promise.all([
          getFollowersByNFT(network, address),
          getFollowingsByNFT(network, address),
          getNFTSaleVolumes(network, address),
          getNFTTransactions(network, address),
        ]);

        setData({
          followers,
          followings,
          stats,
          transactions,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    })();
  }, [network, address]);

  return { data, error, loading, mutate: setData };
}
