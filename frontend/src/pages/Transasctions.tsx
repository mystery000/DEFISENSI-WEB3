import { useState, useEffect } from 'react';

import cn from 'classnames';
import { Spin } from 'antd';
import AppLayout from '../layouts/AppLayout';
import { useAppContext } from '../context/app';
import { NftTransfer, Transaction } from '../types/transaction';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EmptyContainer } from '../components/EmptyContainer';
import {
  findFollowingWallets,
  findFollowingTokens,
  findFollowingNFTs,
} from '../lib/api';
import { TransactionCard } from '../components/transactions/TransactionCard';
import useFollowingTransactions from '../lib/hooks/useFollowingTransactions';
import { NFTTransactionCard } from '../components/transactions/NFTTransactionCard';

enum ContentType {
  WALLET = 'wallet',
  TOKEN = 'token',
  NFT = 'nft',
  ALL = 'all content',
}

export const Transactions = () => {
  // This is the wallet address of the current user
  const { user } = useAppContext();

  const [width, setWidth] = useState(window.innerWidth);
  const [selected, setSelected] = useState<ContentType>(ContentType.WALLET);

  const {
    walletTxns,
    tokenTxns,
    nftTxns,
    error,
    loading,
    fetchMoreWallets,
    fetchMoreTokens,
    fetchMoreNFTs,
    mutateTokenTxns,
    mutateWalletTxns,
    mutateNFTTxns,
    mutateFetchMoreTokens,
    mutateFetchMoreWallets,
    mutateFetchMoreNFTs,
  } = useFollowingTransactions(user.address);

  const fetchMoreWalletTxns = () => {
    setTimeout(async () => {
      try {
        const txns: Transaction[] = [];
        const wallets =
          (await findFollowingWallets(user.address, walletTxns.length + 4)) ||
          [];

        wallets.forEach((wallet) => {
          for (const tx of wallet.transactions) {
            txns.push({
              ...tx,
              address: wallet.address,
              comments: wallet.comments,
              likes: wallet.likes,
              dislikes: wallet.dislikes,
            });
          }
        });
        if (txns.length === walletTxns.length) mutateFetchMoreWallets(false);
        else mutateFetchMoreWallets(true);
        mutateWalletTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  const fetchMoreTokenTxns = () => {
    setTimeout(async () => {
      try {
        const txns: Transaction[] = [];
        const tokens =
          (await findFollowingTokens(user.address, tokenTxns.length + 4)) || [];

        tokens.forEach((token) => {
          for (const tx of token.transactions) {
            txns.push({
              ...tx,
              address: token.address,
              comments: token.comments,
              likes: token.likes,
              dislikes: token.dislikes,
            });
          }
        });
        if (txns.length === tokenTxns.length) mutateFetchMoreTokens(false);
        else mutateFetchMoreTokens(true);
        mutateTokenTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  const fetchMoreNFTTxns = () => {
    setTimeout(async () => {
      try {
        const txns: NftTransfer[] = [];
        const nfts =
          (await findFollowingNFTs(user.address, nftTxns.length + 4)) || [];

        nfts.forEach((nft) => {
          for (const tx of nft.transactions) {
            txns.push({
              ...tx,
              address: nft.address,
              comments: nft.comments,
              likes: nft.likes,
              dislikes: nft.dislikes,
            });
          }
        });

        if (txns.length === nftTxns.length) mutateFetchMoreNFTs(false);
        else mutateFetchMoreNFTs(true);
        mutateNFTTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  // Detect whether screen is mobile or desktop size
  useEffect(() => {
    const breakpoint = 1280;
    window.innerWidth >= breakpoint
      ? setSelected(ContentType.ALL)
      : setSelected(ContentType.WALLET);
    const handleWindowResize = () => {
      if (width < breakpoint && window.innerWidth >= breakpoint) {
        setSelected(ContentType.ALL);
      } else if (width >= breakpoint && window.innerWidth < breakpoint) {
        setSelected(ContentType.WALLET);
      }
      setWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [width]);

  if (error) {
    return (
      <div className="grid h-screen place-items-center">
        Error: {error?.message}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <AppLayout>
        <div className="flex justify-center gap-6 py-8 font-sora text-[32px] xl:hidden">
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.WALLET,
            })}
            onClick={() => setSelected(ContentType.WALLET)}
          >
            Wallets
          </span>
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.TOKEN,
            })}
            onClick={() => setSelected(ContentType.TOKEN)}
          >
            Tokens
          </span>
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.NFT,
            })}
            onClick={() => setSelected(ContentType.NFT)}
          >
            NFTs
          </span>
        </div>
        <div className="flex flex-col items-center gap-4 pt-0 xl:flex-row xl:items-start xl:justify-center xl:pt-8">
          <div
            className={cn('items-center', {
              hidden:
                selected !== ContentType.WALLET && selected !== ContentType.ALL,
            })}
          >
            <div className="mb-4 hidden font-sora text-[32px] xl:block">
              Wallets
            </div>
            {walletTxns.length ? (
              <InfiniteScroll
                dataLength={walletTxns.length}
                next={fetchMoreWalletTxns}
                hasMore={fetchMoreWallets}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {walletTxns.map((txn, idx) => (
                  <TransactionCard
                    key={`wallet${idx}_${txn.txhash}`}
                    transaction={txn}
                    likes={txn.likes}
                    dislikes={txn.dislikes}
                    comments={txn.comments}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContainer border />
            )}
          </div>
          <div
            className={cn('items-center', {
              hidden:
                selected !== ContentType.TOKEN && selected !== ContentType.ALL,
            })}
          >
            <div className="mb-4 hidden font-sora text-[32px] xl:block">
              Tokens
            </div>
            {tokenTxns.length ? (
              <InfiniteScroll
                dataLength={tokenTxns.length}
                next={fetchMoreTokenTxns}
                hasMore={fetchMoreTokens}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {tokenTxns.map((txn, idx) => (
                  <TransactionCard
                    key={`token${idx}_${txn.txhash}`}
                    transaction={txn}
                    likes={txn.likes}
                    dislikes={txn.dislikes}
                    comments={txn.comments}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContainer border />
            )}
          </div>
          <div
            className={cn('items-center', {
              hidden:
                selected !== ContentType.NFT && selected !== ContentType.ALL,
            })}
          >
            <div className="mb-4 hidden font-sora text-[32px] xl:block">
              NFTs
            </div>
            {nftTxns.length ? (
              <InfiniteScroll
                dataLength={nftTxns.length}
                next={fetchMoreNFTTxns}
                hasMore={fetchMoreNFTs}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {nftTxns.map((txn, idx) => (
                  <NFTTransactionCard
                    key={txn.txHash}
                    transaction={txn}
                    likes={txn.likes}
                    dislikes={txn.dislikes}
                    comments={txn.comments}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContainer border />
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
};
