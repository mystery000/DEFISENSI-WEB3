import { FC, useEffect, useState } from "react";

import AppLayout from "../layouts/AppLayout";
import { useAppContext } from "../context/app";
import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
} from "../components/icons/defisensi-icons";
import { findWalletTransactions } from "../lib/api";
import { Transaction, Wallet } from "../types/transaction";
import { TransactionDetailsCard } from "../components/transactions/TransactionDetailsCard";

interface AssetProps {
  className?: string;
}

export const Assets: FC<AssetProps> = ({ className }) => {
  const { user } = useAppContext();

  const [wallet, setWallet] = useState<Wallet | undefined>();

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const wallet = await findWalletTransactions(user.address);
        setWallet(wallet || undefined);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, []);

  if (!wallet) return <div className='text-center'>Loading...</div>;

  return (
    <AppLayout>
      <div className='lg:w-2/3 w-full mx-auto h-screen font-inter font-semibold'>
        <div
          className='p-4'
          style={{
            background:
              "radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)",
          }}
        >
          <div>
            <div className='text-center'>
              <h2 className='font-sora text-4xl'>Aliashraf.eth</h2>
              <span className='text-sm font-medium mt-4'>
                {user.address.slice(0, 11)}.........{user.address.slice(-13)}
              </span>
            </div>
            <div className='flex gap-4 justify-center text-sm mt-5'>
              <div className='flex gap-2 items-center'>
                <FollowingIcon />
                <span>
                  <b>9</b> <span className='text-[#8E98B0]'>Following</span>
                </span>
              </div>
              <div className='flex gap-2 items-center'>
                <FollowerIcon />
                <span>
                  <b>143</b> <span className='text-[#8E98B0]'>Followers</span>
                </span>
              </div>
            </div>
            <div className='text-center text-white mt-5'>
              <button className='bg-[#FF5D29] rounded py-2 px-4'>Follow</button>
            </div>
          </div>
          <div className='flex justify-end'>
            <NotificationOnIcon />
          </div>
        </div>
        <div className='flex lg:flex-row'>
          <div className='lg:w-2/3'></div>
          <div className='flex-1'>
            {wallet.transactions.map((transaction) => (
              <TransactionDetailsCard
                key={transaction.txhash}
                transaction={transaction}
                likes={wallet.likes}
                dislikes={wallet.dislikes}
                comments={wallet.comments}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
