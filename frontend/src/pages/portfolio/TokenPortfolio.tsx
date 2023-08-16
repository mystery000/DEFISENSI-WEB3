import { useParams } from 'react-router-dom';
import { FC, useCallback, useEffect, useState } from 'react';

import AppLayout from '../../layouts/AppLayout';
import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
  PortfolioView,
  UniswapIcon,
} from '../../components/icons/defisensi-icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Transaction } from '../../types/transaction';
import { getTokenTransactions } from '../../lib/api';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { TableContainer } from '@mui/material';

interface TokenPortfolioProps {
  classname?: string;
}

export const TokenPortfolio: FC<TokenPortfolioProps> = ({ classname }) => {
  // const { contractAddress } = useParams();
  const contractAddress = '0x50327c6c5a14DCaDE707ABad2E27eB517df87AB5';

  const [fetchMore, setFetchMore] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    (async () => {
      if (!contractAddress) return;

      const token = await getTokenTransactions('ethereum', contractAddress);
      if (!token) return;

      const txns: Transaction[] = [];
      for (const txn of token.transactions) {
        txns.push({
          ...txn,
          address: token.address,
          comments: token.comments,
          likes: token.likes,
          dislikes: token.dislikes,
        });
      }

      if (txns.length % 4) setFetchMore(false);
      else setFetchMore(true);

      setTransactions(txns);
    })();
  }, [contractAddress]);

  const fetchMoreTransactions = useCallback(async () => {
    try {
      if (!contractAddress) return;

      const token = await getTokenTransactions(
        'ethereum',
        contractAddress,
        transactions.length + 4,
      );

      if (!token) return;

      const txns: Transaction[] = [];

      for (const txn of token.transactions) {
        txns.push({
          ...txn,
          address: token.address,
          comments: token.comments,
          likes: token.likes,
          dislikes: token.dislikes,
        });
      }
      if (transactions.length === txns.length) setFetchMore(false);
      setTimeout(() => setTransactions(txns), 1500);
    } catch (error) {
      console.log(error);
    }
  }, [transactions, contractAddress]);

  if (!contractAddress) return;

  return (
    <AppLayout>
      <div className="h-content mx-auto w-full min-w-[480px] font-inter font-semibold lg:w-2/3">
        <div
          className="w-full min-w-[480px] p-4"
          style={{
            background:
              'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <div className="text-center">
              <h2 className="font-sora text-4xl">
                <span>Hex</span>
              </h2>
              <span className="mt-4 text-sm font-medium">
                {contractAddress.slice(0, 11)}.........
                {contractAddress.slice(-13)}
              </span>
            </div>
            <div className="mt-5 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FollowingIcon />
                <span>
                  <b>9</b> <span className="text-[#8E98B0]">Following</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FollowerIcon />
                <span>
                  <b>143</b> <span className="text-[#8E98B0]">Followers</span>
                </span>
              </div>
            </div>
            <div className="mt-5 text-center text-white">
              <button className="rounded bg-[#FF5D29] px-4 py-2">Follow</button>
            </div>
          </div>
          <div className="flex justify-end">
            <NotificationOnIcon />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-center gap-4 lg:flex-row">
          <div className="mx-4 w-full lg:mx-0 lg:grow">
            <span className="font-sora text-[32px] font-normal">Info</span>
            <div>
              <PortfolioView />
            </div>
            <div className="mt-4 bg-white p-3">
              <span className="text-sora text-2xl font-bold">
                Current Price on Exchanges
              </span>
              <TableContainer className="mt-4">
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}>
                        Exchanges
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        USD Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}>
                        <div className="flex items-center gap-2">
                          <img
                            src="../images/platforms/uni.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Uniswap</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        USD value
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}>
                        <div className="flex items-center gap-2">
                          <img
                            src="../images/platforms/uni.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Binance</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        USD Value
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}>
                        <div className="flex items-center gap-2">
                          <img
                            src="../images/platforms/uni.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Kucoin</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        USD Value
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}>
                        <div className="flex items-center gap-2">
                          <img
                            src="../images/exchanges/coinbase.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Coinbase</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        USD Value
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          <div className="w-full lg:w-fit">
            <span className="font-sora text-[32px] font-normal ">Activity</span>

            <InfiniteScroll
              dataLength={transactions.length}
              next={fetchMoreTransactions}
              hasMore={fetchMore}
              loader={<h4 className="text-center">Loading...</h4>}
            >
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.txhash}
                  transaction={transaction}
                  likes={transaction.likes}
                  dislikes={transaction.dislikes}
                  comments={transaction.comments}
                />
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
