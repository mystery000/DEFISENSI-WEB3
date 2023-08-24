import { useEffect, useState } from 'react';
import { getFollowersByToken, getFollowingsByToken } from '../api';
import { useParams } from 'react-router-dom';

// Get the followers and followings of this token
export default function useTokenPortfolio() {
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
      try {
        const followers = await getFollowersByToken(network, address);
        const followings = await getFollowingsByToken(network, address);
        setData({
          followers: followers || [],
          followings: followings || [],
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [network, address]);

  return { data, error, loading };
}
