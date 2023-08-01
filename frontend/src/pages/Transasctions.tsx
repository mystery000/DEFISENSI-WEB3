import { useState, useEffect } from "react";

import classNames from "classnames";
import AppLayout from "../layouts/AppLayout";
import { useAppContext } from "../context/app";
import { Token, Wallet } from "../types/transaction";
import { BrowserView, MobileView } from "react-device-detect";
import { findWalletTransactions, findTokenTransactions } from "../lib/api";
import { TransactionCard } from "../components/transactions/TransactionCard";

export const Transactions = () => {
  // This is the wallet address of the current user
  const { user, setUser } = useAppContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("wallets");

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const wallets = await findWalletTransactions(user.address);
        setWallets(wallets || []);
        const tokens = await findTokenTransactions(user.address);
        setTokens(tokens || []);
      } catch (error) {
        console.log(error);
        setError(error);
      }
    };
    getTransactions();
  }, []);

  if (!wallets) {
    return <div className='text-center'>Loading wallets</div>;
  }

  if (!tokens) {
    return <div className='text-center'>Loading tokens</div>;
  }

  if (error) {
    return <div className='text-center'>Error: {error?.message}</div>;
  }

  return (
    <>
      <AppLayout>
        <div className='p-4'>
          <BrowserView>
            <div className='flex w-full 2xl:w-2/3 mx-auto mt-4 flex-wrap flex-row justify-center 2xl:justify-around gap-2'>
              <div>
                <div className='items-center'>
                  <div className='mb-4 font-sora text-[32px]'>Wallets</div>
                  {wallets.map((wallet) => (
                    <TransactionCard data={wallet} key={wallet.address} />
                  ))}
                </div>
              </div>
              <div>
                <div className='items-center'>
                  <div className='mb-4 font-sora text-[32px]'>Tokens</div>
                  {tokens.map((token) => (
                    <TransactionCard data={token} key={token.address} />
                  ))}
                </div>
              </div>
              <div>
                <div className='items-center'>
                  <div className='mb-4 font-sora text-[32px]'>NFTs</div>
                  {tokens.map((token) => (
                    <TransactionCard data={token} key={token.address} />
                  ))}
                </div>
              </div>
            </div>
          </BrowserView>
          <MobileView>
            <div className='flex font-sora text-[32px] justify-around'>
              <span
                onClick={() => setActiveTab("wallets")}
                className={classNames("cursor-pointer", {
                  "text-orange-500": activeTab === "wallets",
                })}
              >
                Wallets
              </span>
              <span
                onClick={() => setActiveTab("tokens")}
                className={classNames("cursor-pointer", {
                  "text-orange-500": activeTab === "tokens",
                })}
              >
                Tokens
              </span>
              <span
                onClick={() => setActiveTab("nfts")}
                className={classNames("cursor-pointer", {
                  "text-orange-500": activeTab === "nfts",
                })}
              >
                NFTs
              </span>
            </div>
            <div className='flex w-full mx-auto mt-4 flex-wrap flex-row justify-around gap-2'>
              <div className={classNames({ hidden: activeTab !== "wallets" })}>
                <div className='items-center'>
                  {wallets.map((wallet) => (
                    <TransactionCard data={wallet} key={wallet.address} />
                  ))}
                </div>
              </div>
              <div className={classNames({ hidden: activeTab !== "tokens" })}>
                <div className='items-center'>
                  {tokens.map((token) => (
                    <TransactionCard data={token} key={token.address} />
                  ))}
                </div>
              </div>
              <div className={classNames({ hidden: activeTab !== "nfts" })}>
                <div className='items-center'>
                  {tokens.map((token) => (
                    <TransactionCard data={token} key={token.address} />
                  ))}
                </div>
              </div>
            </div>
          </MobileView>
        </div>
      </AppLayout>
    </>
  );
};
