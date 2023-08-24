import { useEffect, useState } from 'react';
import { Transaction } from '../../types/transaction';
import { useParams } from 'react-router-dom';
import { getTokenTransactions } from '../api';

export default function useTokenTransactions() {
  const { network, address } = useParams();
  const [data, setData] = useState<Transaction[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!network || !address) return;
      try {
        setLoading(true);
        const token = await getTokenTransactions(network, address);

        if (!token) {
          setLoading(false);
          return;
        }

        const txns: Transaction[] = [];
        for (const txn of token.transactions) {
          txns.push({
            ...txn,
            address: token.address,
            comments: token.comments,
            likes: token.likes,
            dislikes: token.dislikes,
          });
        }
        setData(txns);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        console.error(error);
      }
    })();
  }, [address, network]);

  return { transactions: data, error, loading, mutateTransactions: setData };
}
