import { useEffect, useState } from 'react';
import { getFollowersByNFT, getFollowingsByNFT } from '../api';
import { useParams } from 'react-router-dom';

// Get the followers and followings of this token
export default function useNFTPortfolio() {
  const [data, setData] = useState<{
    followers: string[];
    followings: string[];
  }>({ followers: [], followings: [] });
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
        const followers = await getFollowersByNFT(network, address);
        const followings = await getFollowingsByNFT(network, address);
        setData({
          followers: followers || [],
          followings: followings || [],
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
