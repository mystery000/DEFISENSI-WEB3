import { useEffect, useState } from 'react';
import { ExchangePrice, HistoricalPrice } from '../../types/price';
import { useParams } from 'react-router-dom';
import { getPriceFromExchanges } from '../api';

export default function usePriceFromExchanges() {
  const [data, setData] = useState<ExchangePrice>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { network, contractAddress } = useParams();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!network || !contractAddress) return;
        const exchangePrice = await getPriceFromExchanges(
          network,
          contractAddress,
        );
        setData(exchangePrice);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    })();
  }, [network, contractAddress]);

  return { exchangePrice: data, error, loading };
}
