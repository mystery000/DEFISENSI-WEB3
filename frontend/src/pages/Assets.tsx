import { FC, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import { Users2 } from "lucide-react";
import { Card } from "antd";
import { findWalletTransactions } from "../lib/api";

interface AssetProps {
  className?: string;
}

export const Assets: FC<AssetProps> = ({ className }) => {
  const address = "0x6593cDf7B55900cE51FaDd3E2660cF8A9b85d32f";

  useEffect(() => {
    const getTransactions = async () => {
      const transasctions = await findWalletTransactions(address);
      console.log(transasctions);
    };
    getTransactions();
  }, []);

  return (
    <>
      <AppLayout>
        <div className='mx-auto w-2/3  my-4 '>
          <div className='text-center p-4 bg-gradient-to-t from-orange-100 bg-white'>
            <p className='font-bold text-xl'>Aliashraf.eth</p>
            <p className='text-sm'>{address}</p>
            <div className='flex justify-around my-4'>
              <div className='flex gap-4'>
                <div className='flex justify-between gap-4'>
                  <Users2 />
                  <span>
                    <b>9</b>followings
                  </span>
                </div>
                <div className='flex justify-between gap-4'>
                  <Users2 />
                  <span>
                    <b>144</b>followers
                  </span>
                </div>
              </div>
            </div>
            <button className='px-4 py-1 rounded-lg bg-orange-500 text-white text-sm hover:bg-orage-600'>
              Follow
            </button>
          </div>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='w-full md:w-3/5 mt-2'>
              <p className='bg-transparent font-mono'>Portfolio</p>
              <div>
                <Card className='w-full'>
                  <p>Card content</p>
                  <p>Card content</p>
                  <p>Card content</p>
                </Card>
              </div>
              <div>
                <Card className='w-full mt-4'>
                  <p>Card content</p>
                  <p>Card content</p>
                  <p>Card content</p>
                </Card>
              </div>
            </div>
            <div className='w-full md:w-2/5 mt-2'>
              <p className='bg-transparent font-mono'>Transactions</p>
              <div>
                <Card className='w-full'>
                  <p>Card content</p>
                  <p>Card content</p>
                  <p>Card content</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};
