import { useState, useEffect } from "react";

import AppLayout from "../layouts/AppLayout";
import { useAppContext } from "../context/app";
import { Transaction } from "../types/transaction";
import InfiniteScroll from "react-infinite-scroll-component";
import { findFollowingWallets, findFollowingTokens } from "../lib/api";
import { TransactionDetailsCard } from "../components/transactions/TransactionDetailsCard";

export type ExtendedTransaction = Transaction & {
  address: string;
  comments: any[];
  dislikes: any[];
  likes: any[];
};

export const Transactions = () => {
  // This is the wallet address of the current user
  const { user } = useAppContext();
  const [walletTransations, setWalletTransactions] = useState<
    ExtendedTransaction[]
  >([]);
  const [fetchMoreWallets, setFetchMoreWallets] = useState(true);
  const [fetchMoreTokens, setFetchMoreTokens] = useState(true);
  const [tokenTransactions, setTokenTransactions] = useState<
    ExtendedTransaction[]
  >([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const wallets = (await findFollowingWallets(user.address, 4)) || [];
        const walletTxs: ExtendedTransaction[] = [];
        wallets.forEach((wallet) => {
          wallet.transactions.forEach((tx) =>
            walletTxs.push({
              ...tx,
              address: wallet.address,
              comments: wallet.comments,
              likes: wallet.likes,
              dislikes: wallet.dislikes,
            })
          );
        });
        setWalletTransactions(walletTxs || []);

        const tokens = (await findFollowingTokens(user.address, 4)) || [];
        const tokenTxs: ExtendedTransaction[] = [];
        tokens.forEach((token) => {
          token.transactions.forEach((tx) =>
            tokenTxs.push({
              ...tx,
              address: token.address,
              comments: token.comments,
              likes: token.likes,
              dislikes: token.dislikes,
            })
          );
        });
        setTokenTransactions(tokenTxs || []);
      } catch (error) {
        console.log(error);
        setError(error);
      }
    };
    getTransactions();
  }, []);

  if (!walletTransations) {
    return <div className='text-center'>Loading wallets</div>;
  }

  if (!tokenTransactions) {
    return <div className='text-center'>Loading tokens</div>;
  }

  if (error) {
    return <div className='text-center'>Error: {error?.message}</div>;
  }

  const fetchMoreTransactions = async (type: string) => {
    if (type === "wallet") {
      const wallets =
        (await findFollowingWallets(
          user.address,
          walletTransations.length + 4
        )) || [];
      const walletTxs: ExtendedTransaction[] = [];
      wallets.forEach((wallet) => {
        wallet.transactions.forEach((tx) =>
          walletTxs.push({
            ...tx,
            address: wallet.address,
            comments: wallet.comments,
            likes: wallet.likes,
            dislikes: wallet.dislikes,
          })
        );
      });
      if (walletTxs.length === walletTransations.length)
        setFetchMoreWallets(false);
      setTimeout(() => setWalletTransactions(walletTxs || []), 1500);
    } else if (type === "token") {
      const tokens =
        (await findFollowingTokens(
          user.address,
          tokenTransactions.length + 4
        )) || [];
      const tokenTxs: ExtendedTransaction[] = [];
      tokens.forEach((token) => {
        token.transactions.forEach((tx) =>
          tokenTxs.push({
            ...tx,
            address: token.address,
            comments: token.comments,
            likes: token.likes,
            dislikes: token.dislikes,
          })
        );
      });
      if (tokenTxs.length === tokenTransactions.length)
        setFetchMoreWallets(false);
      setTimeout(() => setTokenTransactions(tokenTxs || []), 1500);
    }
  };
  return (
    <>
      <AppLayout>
        <div className='p-4'>
          <div className='flex w-full 2xl:w-2/3 mx-auto mt-4 flex-wrap flex-row justify-center 2xl:justify-around gap-2 h-content'>
            <div>
              <div className='items-center'>
                <div className='mb-4 font-sora text-[32px]'>Wallets</div>
                <InfiniteScroll
                  dataLength={walletTransations.length}
                  next={() => fetchMoreTransactions("wallet")}
                  hasMore={fetchMoreWallets}
                  loader={<h4 className='text-center'>Loading...</h4>}
                  endMessage={
                    <div className='text-center'>
                      No transactions to load more
                    </div>
                  }
                >
                  {walletTransations.map((tx) => (
                    <TransactionDetailsCard
                      key={tx.txhash}
                      transaction={tx}
                      likes={tx.likes}
                      dislikes={tx.dislikes}
                      comments={tx.comments}
                    />
                  ))}
                </InfiniteScroll>
              </div>
            </div>
            <div>
              <div className='items-center'>
                <div className='mb-4 font-sora text-[32px]'>Tokens</div>
                <InfiniteScroll
                  dataLength={tokenTransactions.length}
                  next={() => fetchMoreTransactions("token")}
                  hasMore={fetchMoreTokens}
                  loader={<h4 className='text-center'>Loading...</h4>}
                  endMessage={
                    <div className='text-center'>
                      No transactions to load more
                    </div>
                  }
                >
                  {tokenTransactions.map((tx) => (
                    <TransactionDetailsCard
                      key={tx.txhash}
                      transaction={tx}
                      likes={tx.likes}
                      dislikes={tx.dislikes}
                      comments={tx.comments}
                    />
                  ))}
                </InfiniteScroll>
              </div>
            </div>
            <div>
              <div className='items-center'>
                <div className='mb-4 font-sora text-[32px]'>NFTs</div>
                <InfiniteScroll
                  dataLength={tokenTransactions.length}
                  next={() => fetchMoreTransactions("token")}
                  hasMore={fetchMoreTokens}
                  loader={<h4 className='text-center'>Loading...</h4>}
                  endMessage={
                    <div className='text-center'>
                      No transactions to load more
                    </div>
                  }
                >
                  {tokenTransactions.map((tx) => (
                    <TransactionDetailsCard
                      key={tx.txhash}
                      transaction={tx}
                      likes={tx.likes}
                      dislikes={tx.dislikes}
                      comments={tx.comments}
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
