import { useEffect, useState } from 'react';
import {
  findFollowingNFTs,
  findFollowingTokens,
  findFollowingWallets,
} from '../api';
import { NFT, Transaction } from '../../types/transaction';

export default function useFollowingTransactions(address: string) {
  const [walletTxns, setWalletTxns] = useState<Transaction[]>([]);
  const [tokenTxns, setTokenTxns] = useState<Transaction[]>([]);
  const [nftTxns, setNFTTxns] = useState<Transaction<NFT>[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchMoreWallets, setFetchMoreWallets] = useState(false);
  const [fetchMoreTokens, setFetchMoreTokens] = useState(false);
  const [fetchMoreNFTs, setFetchMoreNFTs] = useState(false);

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

        const nfts = (await findFollowingNFTs(address)) || [];
        const nftTxns: Transaction<NFT>[] = [];

        nfts.forEach((nft) => {
          for (const tx of nft.transactions) {
            nftTxns.push({
              ...tx,
              address: nft.address,
              comments: nft.comments,
              likes: nft.likes,
              dislikes: nft.dislikes,
            });
          }
        });

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
