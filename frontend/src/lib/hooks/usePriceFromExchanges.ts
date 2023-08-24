import { useEffect, useState } from 'react';
import { ExchangePrice } from '../../types/price';
import { useParams } from 'react-router-dom';
import { getPriceFromExchanges } from '../api';

export default function usePriceFromExchanges() {
  const [data, setData] = useState<ExchangePrice>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { network, address } = useParams();

  useEffect(() => {
    (async () => {
      try {
        if (!network || !address) return;
        setLoading(true);
        const exchangePrice = await getPriceFromExchanges(network, address);
        setData(exchangePrice);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        console.error(error);
      }
    })();
  }, [network, address]);

  return { exchangePrice: data, error, loading };
}
