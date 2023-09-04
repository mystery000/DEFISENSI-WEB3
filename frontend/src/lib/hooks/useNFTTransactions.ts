import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getNFTTransactions } from '../api';
import { NFT, Transaction } from '../../types/transaction';

export default function useNFTTransactions() {
  const { network, address } = useParams();
  const [data, setData] = useState<Transaction<NFT>[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!network || !address) return;
      try {
        setLoading(true);
        const token = await getNFTTransactions(network, address);

        if (!token) {
          setLoading(false);
          return;
        }

        const txns: Transaction<NFT>[] = [];
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
