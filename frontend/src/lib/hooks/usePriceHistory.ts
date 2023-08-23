import { useEffect, useState } from 'react';
import { HistoricalPrice } from '../../types/price';
import { useParams } from 'react-router-dom';
import { getPriceHistory } from '../api';

export default function usePriceHistory() {
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { network, contractAddress } = useParams();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!network || !contractAddress) return;
        const prices = await getPriceHistory(network, contractAddress);
        setData(prices);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    })();
  }, [network, contractAddress]);

  return { priceHistory: data, error, loading };
}
