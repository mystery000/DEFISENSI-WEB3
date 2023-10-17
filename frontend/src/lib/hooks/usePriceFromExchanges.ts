import { useEffect, useState } from 'react';
import { ExchangePrice } from '../../types/price';
import { useParams } from 'react-router-dom';
import { getPriceFromExchanges } from '../api';

export default function usePriceFromExchanges() {
  const { network, address } = useParams();
  const [data, setData] = useState<ExchangePrice>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
