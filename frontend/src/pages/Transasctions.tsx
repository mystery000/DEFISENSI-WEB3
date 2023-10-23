import { useState, useEffect } from 'react';

import cn from 'classnames';
import { Spin } from 'antd';
import AppLayout from '../layouts/AppLayout';
import { useAppContext } from '../context/app';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EmptyContainer } from '../components/EmptyContainer';
import { TransactionCard } from '../components/transactions/TransactionCard';
import useFollowingTransactions from '../lib/hooks/useFollowingTransactions';
import { NFTTransactionCard } from '../components/transactions/NFTTransactionCard';
import { findFollowingWallets, findFollowingTokens, findFollowingNFTs } from '../lib/api';
import { NFTTransaction, TokenTransaction, TransactionType, WalletTransaction } from '../types/transaction';

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
        const txns: WalletTransaction[] = [];
        const wallets = await findFollowingWallets(user.address, walletTxns.length + 4);

        if (txns.length === walletTxns.length) mutateFetchMoreWallets(false);
        else mutateFetchMoreWallets(true);
        mutateWalletTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  const fetchMoreTokenTxns = () => {
    setTimeout(async () => {
      try {
        const txns: TokenTransaction[] = [];
        const tokens = await findFollowingTokens(user.address, tokenTxns.length + 4);
        if (txns.length === tokenTxns.length) mutateFetchMoreTokens(false);
        else mutateFetchMoreTokens(true);
        mutateTokenTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  const fetchMoreNFTTxns = () => {
    setTimeout(async () => {
      try {
        const txns: NFTTransaction[] = [];
        const nfts = await findFollowingNFTs(user.address, nftTxns.length + 4);
        if (txns.length === nftTxns.length) mutateFetchMoreNFTs(false);
        else mutateFetchMoreNFTs(true);
        mutateNFTTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  // Detect whether screen is mobile or desktop size
  useEffect(() => {
    const breakpoint = 1280;
    window.innerWidth >= breakpoint ? setSelected(ContentType.ALL) : setSelected(ContentType.WALLET);
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
    return <div className="grid h-screen place-items-center">Error: {error?.message}</div>;
  }

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }
  return (
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
            hidden: selected !== ContentType.WALLET && selected !== ContentType.ALL,
          })}
        >
          <div className="mb-4 hidden font-sora text-[32px] xl:block">Wallets</div>
          {walletTxns.length ? (
            <InfiniteScroll
              dataLength={walletTxns.length}
              next={fetchMoreWalletTxns}
              hasMore={fetchMoreWallets}
              loader={<h4 className="text-center">Loading...</h4>}
            >
              {walletTxns.map((txn) => {
                if (txn.type === TransactionType.NFT) {
                  return (
                    <NFTTransactionCard
                      key={txn.id}
                      txn={txn as NFTTransaction}
                      transactionType={TransactionType.WALLET}
                    />
                  );
                } else if (txn.type === TransactionType.TOKEN) {
                  return (
                    <TransactionCard
                      key={txn.id}
                      txn={txn as TokenTransaction}
                      transactionType={TransactionType.WALLET}
                    />
                  );
                }
              })}
            </InfiniteScroll>
          ) : (
            <EmptyContainer border />
          )}
        </div>
        <div
          className={cn('items-center', {
            hidden: selected !== ContentType.TOKEN && selected !== ContentType.ALL,
          })}
        >
          <div className="mb-4 hidden font-sora text-[32px] xl:block">Tokens</div>
          {tokenTxns.length ? (
            <InfiniteScroll
              dataLength={tokenTxns.length}
              next={fetchMoreTokenTxns}
              hasMore={fetchMoreTokens}
              loader={<h4 className="text-center">Loading...</h4>}
            >
              {tokenTxns.map((txn, idx) => (
                <TransactionCard key={txn.id} txn={txn} transactionType={TransactionType.TOKEN} />
              ))}
            </InfiniteScroll>
          ) : (
            <EmptyContainer border />
          )}
        </div>
        <div
          className={cn('items-center', {
            hidden: selected !== ContentType.NFT && selected !== ContentType.ALL,
          })}
        >
          <div className="mb-4 hidden font-sora text-[32px] xl:block">NFTs</div>
          {nftTxns.length ? (
            <InfiniteScroll
              dataLength={nftTxns.length}
              next={fetchMoreNFTTxns}
              hasMore={fetchMoreNFTs}
              loader={<h4 className="text-center">Loading...</h4>}
            >
              {nftTxns.map((txn, idx) => (
                <NFTTransactionCard key={txn.id} txn={txn} transactionType={TransactionType.NFT} />
              ))}
            </InfiniteScroll>
          ) : (
            <EmptyContainer border />
          )}
        </div>
      </div>
    </AppLayout>
  );
};
