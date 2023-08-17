import { useParams } from 'react-router-dom';
import { FC, useCallback, useEffect, useState } from 'react';

import AppLayout from '../../layouts/AppLayout';
import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
  PortfolioView,
} from '../../components/icons/defisensi-icons';

import cn from 'classnames';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { TableContainer } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { getTokenTransactions } from '../../lib/api';
import { Transaction } from '../../types/transaction';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TransactionCard } from '../../components/transactions/TransactionCard';

enum ContentType {
  INFO = 'info',
  ACTIVITY = 'activity',
  ALL = 'all',
}

interface TokenPortfolioProps {
  classname?: string;
}

export const TokenPortfolio: FC<TokenPortfolioProps> = ({ classname }) => {
  // const { contractAddress } = useParams();
  const contractAddress = '0x50327c6c5a14DCaDE707ABad2E27eB517df87AB5';

  const [width, setWidth] = useState(window.innerWidth);
  const [selected, setSelected] = useState<ContentType>(ContentType.INFO);

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

  // Detect whether screen is mobile or desktop size
  useEffect(() => {
    const breakpoint = 1536;
    const handleWindowResize = () => {
      if (width < breakpoint && window.innerWidth >= breakpoint) {
        setSelected(ContentType.ALL);
      } else if (width >= breakpoint && window.innerWidth < breakpoint) {
        setSelected(ContentType.INFO);
      }
      setWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [width]);

  if (!contractAddress) return;

  return (
    <AppLayout>
      <div className="w-full font-inter md:mx-auto md:w-2/3 2xl:w-fit">
        <div
          className="p-6 text-center"
          style={{
            background:
              'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <h2 className="flex items-center justify-center gap-1 font-sora text-4xl font-semibold">
              <span>ETH</span>
              <span className="flex items-center gap-2 rounded-lg bg-black px-2 py-[3px] text-sm font-light text-white">
                <img
                  src="../images/tokens/eth.png"
                  width={32}
                  height={32}
                  alt="noicon"
                ></img>
                <span>on Ethereum</span>
              </span>
            </h2>
            <span className="mt-4 text-sm font-medium">
              {contractAddress.slice(0, 11)}.........
              {contractAddress.slice(-13)}
            </span>
          </div>
          <div className="mt-5 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FollowingIcon />
              <span>9</span>
              <span className="text-bali-hai-600">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <FollowerIcon />
              <span>143</span>
              <span className="text-bali-hai-600">Followers</span>
            </div>
          </div>
          <div className="mt-5 text-white">
            <button className="rounded bg-orange-400 px-4 py-[10px]">
              Follow
            </button>
          </div>

          <div className="flex justify-end">
            <NotificationOnIcon />
          </div>
        </div>
        <div className="mt-2 flex justify-start gap-6 bg-white px-4 py-6 font-sora text-[32px] 2xl:hidden ">
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.INFO,
            })}
            onClick={() => setSelected(ContentType.INFO)}
          >
            Info
          </span>
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.ACTIVITY,
            })}
            onClick={() => setSelected(ContentType.ACTIVITY)}
          >
            Activity
          </span>
        </div>
        <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
          {/* Info */}
          <div
            className={cn('px-0 2xl:w-[808px]', {
              hidden:
                selected !== ContentType.INFO && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Info</span>
            {/* Portfolio */}
            <div>
              <PortfolioView />
            </div>
            {/* Current Price on Exchanges */}
            <div className="mt-2 bg-white p-4">
              <span className="text-sora text-xl font-semibold">
                Current Price on Exchanges
              </span>
              <TableContainer className="mt-4">
                <Table sx={{ minWidth: 400 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                        Exchanges
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                        <div className="flex items-center gap-2">
                          <span className="bg-bali-hai-600/20 flex items-center gap-2 rounded-lg px-2 py-1">
                            <img
                              src="../images/tokens/eth.png"
                              width={24}
                              height={24}
                              alt="noicon"
                            ></img>
                            <span>HEX</span>
                          </span>
                          <span className="text-bali-hai-600">USD value</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
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
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        $3112254546465
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
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
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        $3112254546465
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
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
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        $3112254546465
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
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
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        $3112254546465
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          {/* Activity */}
          <div
            className={cn('mx-auto 2xl:mx-0', {
              hidden:
                selected !== ContentType.ACTIVITY &&
                selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">
              Transactions
            </span>
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
