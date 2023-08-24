import { useEffect, useState } from 'react';
import { findFollowingTokens, findFollowingWallets } from '../api';
import { Transaction } from '../../types/transaction';

export default function useFollowingTransactions(address: string) {
  const [walletTxns, setWalletTxns] = useState<Transaction[]>([]);
  const [tokenTxns, setTokenTxns] = useState<Transaction[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchMoreWallets, setFetchMoreWallets] = useState(false);
  const [fetchMoreTokens, setFetchMoreTokens] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const wallets = (await findFollowingWallets(address)) || [];
        const walletTxns: Transaction[] = [];
        wallets.forEach((wallet) => {
          for (const tx of wallet.transactions) {
            walletTxns.push({
              ...tx,
              address: wallet.address,
              comments: wallet.comments,
              likes: wallet.likes,
              dislikes: wallet.dislikes,
            });
          }
        });

        const tokens = (await findFollowingTokens(address)) || [];
        const tokenTxns: Transaction[] = [];

        tokens.forEach((token) => {
          for (const tx of token.transactions) {
            tokenTxns.push({
              ...tx,
              address: token.address,
              comments: token.comments,
              likes: token.likes,
              dislikes: token.dislikes,
            });
          }
        });

        if (walletTxns.length % 4 === 0) setFetchMoreWallets(true);
        setWalletTxns(walletTxns);
        if (tokenTxns.length % 4 === 0) setFetchMoreTokens(true);
        setTokenTxns(tokenTxns);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        setWalletTxns([]);
        setTokenTxns([]);
      }
    })();
  }, [address]);

  return {
    walletTxns,
    tokenTxns,
    error,
    loading,
    fetchMoreTokens,
    fetchMoreWallets,
    mutateWalletTxns: setWalletTxns,
    mutateTokenTxns: setTokenTxns,
    mutateFetchMoreWallets: setFetchMoreWallets,
    mutateFetchMoreTokens: setFetchMoreTokens,
  };
}
