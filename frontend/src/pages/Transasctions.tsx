import { useState, useEffect } from 'react';

import AppLayout from '../layouts/AppLayout';
import { useAppContext } from '../context/app';
import { Transaction } from '../types/transaction';
import InfiniteScroll from 'react-infinite-scroll-component';
import { findFollowingWallets, findFollowingTokens } from '../lib/api';
import { TransactionCard } from '../components/transactions/TransactionDetailsCard';

export const Transactions = () => {
  // This is the wallet address of the current user
  const { user } = useAppContext();

  const [walletTxns, setWalletTxns] = useState<Transaction[]>([]);
  const [tokenTxns, setTokenTxns] = useState<Transaction[]>([]);

  const [fetchMoreWallets, setFetchMoreWallets] = useState(false);
  const [fetchMoreTokens, setFetchMoreTokens] = useState(false);

  const [error, setError] = useState<any>(null);

  // Get transactions from the followed wallets and tokens
  useEffect(() => {
    (async () => {
      try {
        const wallets = (await findFollowingWallets(user.address, 4)) || [];
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

        if (walletTxns.length % 4 == 0) setFetchMoreWallets(true);
        setWalletTxns(walletTxns);

        const tokens = (await findFollowingTokens(user.address, 4)) || [];
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
        if (tokenTxns.length % 4 == 0) setFetchMoreTokens(true);
        setTokenTxns(tokenTxns);
      } catch (error) {
        console.log(error);
        setError(error);
      }
    })();
  }, []);

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
        if (txns.length == walletTxns.length) setFetchMoreWallets(false);
        else setFetchMoreWallets(true);
        setWalletTxns(txns);
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
        if (txns.length == tokenTxns.length) setFetchMoreTokens(false);
        else setFetchMoreTokens(true);
        setTokenTxns(txns);
      } catch (error) {}
    }, 1500);
  };

  if (error) {
    return <div className="text-center">Error: {error?.message}</div>;
  }

  return (
    <>
      <AppLayout>
        <div className="p-4">
          <div className="h-content mx-auto mt-4 flex w-full flex-row flex-wrap justify-center gap-2 2xl:w-2/3 2xl:justify-around">
            <div>
              <div className="items-center">
                <div className="mb-4 font-sora text-[32px]">Wallets</div>
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
              </div>
            </div>
            <div>
              <div className="items-center">
                <div className="mb-4 font-sora text-[32px]">Tokens</div>
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
              </div>
            </div>
            <div>
              <div className="items-center">
                <div className="mb-4 font-sora text-[32px]">NFTs</div>
                <InfiniteScroll
                  dataLength={tokenTxns.length}
                  next={fetchMoreTokenTxns}
                  hasMore={fetchMoreTokens}
                  loader={<h4 className="text-center">Loading...</h4>}
                >
                  {tokenTxns.map((txn, idx) => (
                    <TransactionCard
                      key={`nft${idx}_${txn.txhash}`}
                      transaction={txn}
                      likes={txn.likes}
                      dislikes={txn.dislikes}
                      comments={txn.comments}
                    />
                  ))}
                </InfiniteScroll>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};
