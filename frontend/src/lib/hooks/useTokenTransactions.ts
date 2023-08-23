import { useEffect, useState } from 'react';
import { Transaction } from '../../types/transaction';
import { useParams } from 'react-router-dom';
import { getTokenTransactions } from '../api';

export default function useTokenTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { network, contractAddress } = useParams();

  useEffect(() => {
    (async () => {
      if (!network || !contractAddress) return;
      try {
        setLoading(true);
        const token = await getTokenTransactions(network, contractAddress);

        if (!token) return;

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
      }
    })();
  }, [contractAddress, network]);

  return { transactions: data, error, loading, mutateTransactions: setData };
}
