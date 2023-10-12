import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getPriceHistory } from '../api';

export default function usePriceHistory() {
  const [data, setData] = useState([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { network, address } = useParams();

  useEffect(() => {
    // (async () => {
    //   try {
    //     if (!network || !address) return;
    //     setLoading(true);
    //     const prices = await getPriceHistory(network, address);
    //     setData(prices);
    //     setLoading(false);
    //   } catch (error) {
    //     setError(error);
    //     setLoading(false);
    //     console.error(error);
    //   }
    // })();
  }, [network, address]);

  return { priceHistory: data, error, loading };
}
