import { useEffect, useState } from 'react';

import { findFollowingNFTs, findFollowingTokens, findFollowingWallets } from '../api';
import { NFTTransaction, TokenTransaction, WalletTransaction } from '../../types/transaction';

export default function useFollowingTransactions(address: string) {
  const [walletTxns, setWalletTxns] = useState<WalletTransaction[]>([]);
  const [tokenTxns, setTokenTxns] = useState<TokenTransaction[]>([]);
  const [nftTxns, setNFTTxns] = useState<NFTTransaction[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchMoreWallets, setFetchMoreWallets] = useState(false);
  const [fetchMoreTokens, setFetchMoreTokens] = useState(false);
  const [fetchMoreNFTs, setFetchMoreNFTs] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [walletTxns, tokenTxns, nftTxns] = await Promise.all([
          findFollowingWallets(address),
          findFollowingTokens(address),
          findFollowingNFTs(address),
        ]);
        if (walletTxns.length % 4 === 0) setFetchMoreWallets(true);
        setWalletTxns(walletTxns);
        if (tokenTxns.length % 4 === 0) setFetchMoreTokens(true);
        setTokenTxns(tokenTxns);
        if (nftTxns.length % 4 === 0) setFetchMoreNFTs(true);
        setNFTTxns(nftTxns);
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
    nftTxns,
    error,
    loading,
    fetchMoreTokens,
    fetchMoreWallets,
    fetchMoreNFTs,
    mutateWalletTxns: setWalletTxns,
    mutateTokenTxns: setTokenTxns,
    mutateNFTTxns: setNFTTxns,
    mutateFetchMoreWallets: setFetchMoreWallets,
    mutateFetchMoreTokens: setFetchMoreTokens,
    mutateFetchMoreNFTs: setFetchMoreNFTs,
  };
}
