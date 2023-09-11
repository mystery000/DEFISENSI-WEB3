import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFollowersByWallet, getFollowingsByWallet, getENS } from '../api';

// Get the followers and followings of this wallet
export default function useWalletPortfolio() {
  const [data, setData] = useState<{
    followers: any[];
    followings: any[];
    ens?: string;
  }>({ followers: [], followings: [], ens: '' });

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { address } = useParams();

  useEffect(() => {
    (async () => {
      if (!address) {
        setError('The address parameter is now omitted.');
        return;
      }
      setLoading(true);
      try {
        const followers = await getFollowersByWallet(address);
        const followings = await getFollowingsByWallet(address);
        const ens = await getENS(address);
        setData({
          followers: followers || [],
          followings: followings || [],
          ens: ens,
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    })();
  }, [address]);

  return { data, error, loading, mutate: setData };
}
