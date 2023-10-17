import { useEffect, useState } from 'react';
import { getFollowersByNFT, getFollowingsByNFT, getNFTSaleVolumes, getNFTTransactions } from '../api';
import { useParams } from 'react-router-dom';
import { NftTransfer } from '../../types/transaction';
import { NFTSaleVolumesResponse } from '../../types/price';

export type NFTPortfolio = {
  followers: string[];
  followings: string[];
  stats?: NFTSaleVolumesResponse;
  transactions: NftTransfer[];
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
        const [followers, followings, stats, nft] = await Promise.all([
          getFollowersByNFT(network, address),
          getFollowingsByNFT(network, address),
          getNFTSaleVolumes(network, address),
          getNFTTransactions(network, address),
        ]);

        const txns: NftTransfer[] = [];

        if (nft) {
          for (const txn of nft.transactions) {
            txns.push({
              ...txn,
              address: nft?.address,
              comments: nft?.comments,
              likes: nft?.likes,
              dislikes: nft?.dislikes,
            });
          }
        }

        setData({
          followers,
          followings,
          stats,
          transactions: txns,
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
