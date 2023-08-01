import { useState, useEffect } from "react";
import { TransactionCard } from "../components/transactions/TransactionCard";
import AppLayout from "../layouts/AppLayout";
import { Token, Transaction, Wallet } from "../types/transaction";
import { findWalletTransactions, findTokenTransactions } from "../lib/api";
import { useAppContext } from "../context/app";

export const Transactions = () => {
  // This is the wallet address of the current user
  const { user, setUser } = useAppContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const [tokens, setTokens] = useState<Token[]>([]);

  const [error, setError] = useState<any>(null);

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
          <div className='text-center text-2xl font-bold font-sora'>
            Transaction Overview
          </div>
          <div className='flex w-2/3 mx-auto mt-4 flex-wrap lg:flex-row flex-col justify-around gap-4'>
            <div>
              <div className='items-center'>
                <div className='mb-4 text-2xl font-mono'>Wallets</div>
                {wallets.map((wallet) => (
                  <TransactionCard data={wallet} />
                ))}
              </div>
            </div>
            <div>
              <div className='items-center'>
                <div className='mb-4 text-2xl font-mono'>Tokens</div>
                {tokens.map((token) => (
                  <TransactionCard data={token} />
                ))}
              </div>
            </div>
            <div>
              <div className='items-center'>
                <div className='mb-4 text-2xl font-mono'>NFTs</div>
                {tokens.map((token) => (
                  <TransactionCard data={token} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};
