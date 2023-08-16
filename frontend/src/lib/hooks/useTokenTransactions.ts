import { useEffect, useState } from 'react';
import { Transaction } from '../../types/transaction';

export default function useTokenTransactions(contractAddress: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    })();
  }, []);

  return { data, error, loading };
}
