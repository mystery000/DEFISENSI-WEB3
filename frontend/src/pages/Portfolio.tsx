import { FC, useEffect, useState } from "react";

import AppLayout from "../layouts/AppLayout";
import { useAppContext } from "../context/app";
import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
  TrackerView,
} from "../components/icons/defisensi-icons";
import { GetTokenBalances, findWalletTransactions } from "../lib/api";
import { Transaction, Wallet } from "../types/transaction";
import { TransactionDetailsCard } from "../components/transactions/TransactionDetailsCard";
import { Asset } from "../components/portfolio/asset";
import { TransactionType } from "../types/enums";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TokenBalance } from "../types/balance";
import { converBaseUnit } from "../lib/utils";

interface AssetProps {
  className?: string;
}
export const Portfolio: FC<AssetProps> = ({ className }) => {
  const { user } = useAppContext();
  const [wallet, setWallet] = useState<Wallet | undefined>();
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const wallet = await findWalletTransactions(user.address);
        setWallet(wallet || undefined);
        const balances = await GetTokenBalances(
          "0xff84e63AFa449A0Fb698d6332c7398cF042348ba"
        );
        setBalances(balances || []);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, []);

  if (!wallet) return <div className='text-center'>Loading...</div>;
  console.log(balances);
  return (
    <AppLayout>
      <div className='lg:w-2/3 w-full mx-auto h-content font-inter font-semibold min-w-[480px]'>
        <div
          className='p-4 w-full min-w-[480px]'
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
        <div className='flex lg:flex-row flex-col justify-center gap-4'>
          <div className='lg:grow lg:mx-0 mx-4 w-full'>
            <span className='font-sora font-normal text-[32px]'>Portfolio</span>
            <div className='mb-4 '>
              <TrackerView />
            </div>
            <div className='bg-white p-3'>
              <div className='flex justify-between'>
                <span className='text-sora'>Asset Overview</span>
                <select
                  className='text-inter px-2 py-1 rounded-md border'
                  defaultValue={"oneday"}
                >
                  <option value='oneday'>1 day</option>
                </select>
              </div>
              <div className='flex flex-wrap gap-4 justify-between mt-4'>
                <Asset blockchain='All' balance={3.12} />
                <Asset blockchain='BNB Chain' balance={100} />
                <Asset blockchain='ETH' balance={2.12} />
                <Asset blockchain='Polygon' balance={90} />
              </div>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}> Token</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        USD Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balances.map((token, id) => (
                      <TableRow
                        key={token.name + id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <img
                              src={
                                token.symbol === "ETH"
                                  ? "./images/tokens/eth.png"
                                  : token.logo
                              }
                              width={32}
                              height={32}
                              alt='no icon'
                            />
                            {token.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {Number(token.balance).toLocaleString()}
                        </TableCell>
                        {/* <TableCell>${balance.usd.toLocaleString()}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          <div className='lg:w-fit w-full'>
            <span className='font-sora font-normal text-[32px] '>
              Transactions
            </span>
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
