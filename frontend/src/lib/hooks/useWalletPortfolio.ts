import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFollowersByWallet, getFollowingsByWallet } from '../api';

// Get the followers and followings of this wallet
export default function useWalletPortfolio() {
  const [data, setData] = useState<{
    followers: any[];
    followings: any[];
  }>({ followers: [], followings: [] });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { address } = useParams();

  useEffect(() => {
    (async () => {
      if (!address) {
        setError('The address parameter is now omitted.');
        return;
      }
      try {
        const followers = await getFollowersByWallet(address);
        const followings = await getFollowingsByWallet(address);
        setData({
          followers: followers || [],
          followings: followings || [],
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [address]);

  return { data, error, loading };
}
