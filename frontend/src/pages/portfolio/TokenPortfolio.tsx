import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import cn from 'classnames';
import { Spin } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import Table from '@mui/material/Table';
import { followToken } from '../../lib/api';
import TableRow from '@mui/material/TableRow';
import { TableContainer } from '@mui/material';
import { keyFormatter } from '../../lib/utils';
import AppLayout from '../../layouts/AppLayout';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useAppContext } from '../../context/app';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EmptyContainer } from '../../components/EmptyContainer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useTokenPortfolio from '../../lib/hooks/useTokenPortfolio';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FollowerIcon, FollowingIcon, NotificationOnIcon } from '../../components/icons/defisensi-icons';
import { TokenTransaction, TransactionType } from '../../types/transaction';

enum ContentType {
  INFO = 'info',
  ACTIVITY = 'activity',
  ALL = 'all',
}

export const TokenPortfolio = () => {
  const { user } = useAppContext();
  const { address, network } = useParams();
  const [following, setFollowing] = useState(false);
  const [fetchMore, setFetchMore] = useState(false);
  const [noticationOn, setNotificationOn] = useState(false);
  // Responsive Design
  const [width, setWidth] = useState(window.innerWidth);
  const [selected, setSelected] = useState<ContentType>(ContentType.INFO);
  // Custom Hooks
  const { portfolio, loading, mutate } = useTokenPortfolio();

  const fetchMoreTransactions = useCallback(async () => {}, []);

  // Detect whether screen is mobile or desktop size
  useEffect(() => {
    const breakpoint = 1536;
    window.innerWidth >= breakpoint ? setSelected(ContentType.ALL) : setSelected(ContentType.INFO);
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

  const handleFollow = useCallback(async () => {
    if (!address || !network) return;
    try {
      setFollowing(true);
      await followToken(user.address, address, network, portfolio.transactions);
      mutate({ ...portfolio, followers: [...portfolio.followers, user.address] });
      setFollowing(false);
      toast.success(`You've followed this token: ${address}`);
    } catch (error) {
      setFollowing(false);
      toast.error((error as any).message);
    }
  }, [network, address, portfolio, user]);

  if (!address || !network) return;

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  const data = portfolio.tokenPrices?.prices
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((price) => ({
      date: new Date(price.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      price: price.price,
      pretty_price: price.pretty_price,
    }));

  return (
    <AppLayout>
      <div className="w-full font-inter md:mx-auto md:w-2/3 2xl:w-fit">
        {/* Header Bar */}
        <div
          className="p-6 text-center"
          style={{
            background: 'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <h2 className="flex items-center justify-center gap-1 font-sora text-4xl font-semibold">
              <span>{portfolio.tokenPrices?.contract_ticker_symbol}</span>
              <span className="flex items-center gap-2 rounded-lg bg-black px-2 py-[3px] text-sm font-light text-white">
                <img
                  src={`/images/network/${network}.png`}
                  width={32}
                  height={32}
                  alt="noicon"
                  className="rounded-full"
                  loading="lazy"
                ></img>
                <span>{`on ${network[0].toUpperCase() + network.slice(1)}`}</span>
              </span>
            </h2>
            <span className="mt-4 text-sm font-medium" title={address}>
              {address.slice(0, 11)}.........
              {address.slice(-10)}
            </span>
          </div>
          <div className="mt-5 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FollowingIcon />
              <span>{portfolio.followings.length}</span>
              <span className="text-bali-hai-600">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <FollowerIcon />
              <span>{portfolio.followers.length}</span>
              <span className="text-bali-hai-600">Followers</span>
            </div>
          </div>
          <div className="mt-5 text-white">
            <button
              className="text-inter rounded bg-orange-400 px-4 py-2 font-bold"
              onClick={handleFollow}
              disabled={following}
            >
              {following ? 'Following...' : 'Follow'}
            </button>
          </div>

          <div className="flex justify-end hover:cursor-pointer" onClick={() => setNotificationOn((state) => !state)}>
            {noticationOn ? <NotificationOnIcon /> : <NotificationsIcon />}
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
        {/* Main */}
        <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
          {/* Info */}
          <div
            className={cn('px-0 2xl:w-[808px]', {
              hidden: selected !== ContentType.INFO && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Info</span>
            {/* Portfolio */}
            <div className="bg-white">
              <div className="flex justify-between p-4 font-sora text-2xl font-semibold">
                <span>{`${portfolio.tokenPrices?.contract_ticker_symbol}-USD Price History`}</span>
              </div>
              <ResponsiveContainer height={430} width="100%">
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="pretty_price" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3354F4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6359E8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    interval={365}
                    tickFormatter={(date) => moment(date).format('YYYY')}
                    axisLine={false}
                  />
                  <YAxis orientation="right" axisLine={false} tickLine={false} tickFormatter={keyFormatter} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#pretty_price)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Current Price on Exchanges */}
            <div className="mt-2 bg-white p-4">
              <span className="text-sora text-xl font-semibold">Current Price on Exchanges</span>
              <TableContainer className="mt-4">
                <Table sx={{ minWidth: 400 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Exchanges</TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-2 rounded-lg bg-bali-hai-600/20 px-2 py-1">
                            <img src={`/images/network/${network}.png`} width={24} height={24} alt="noicon"></img>
                            <span>{portfolio.tokenPrices?.contract_ticker_symbol}</span>
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
                            src="/images/exchanges/uniswap.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Uniswap</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        {portfolio.exchangePrices.uniswap
                          ? `$${Number(portfolio.exchangePrices.uniswap).toFixed(3)}`
                          : 'This token is not supported'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/exchanges/binance.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Binance</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        {portfolio.exchangePrices.binance
                          ? `$${portfolio.exchangePrices.binance}`
                          : 'This token is not supported'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/exchanges/kucoin.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Kucoin</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        {portfolio.exchangePrices.kucoin
                          ? `$${portfolio.exchangePrices?.kucoin}`
                          : 'This token is not supported'}
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
                            src="/images/exchanges/coinbase.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Coinbase</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        {portfolio.exchangePrices.coinbase
                          ? `$${portfolio.exchangePrices.coinbase}`
                          : 'This token is not supported'}
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
              hidden: selected !== ContentType.ACTIVITY && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Transactions</span>
            {portfolio.transactions.length ? (
              <InfiniteScroll
                dataLength={portfolio.transactions.length}
                next={fetchMoreTransactions}
                hasMore={fetchMore}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {portfolio.transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.txHash}
                    txn={transaction}
                    transactionType={TransactionType.TOKEN}
                    mutate={mutate}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContainer descirption="no transactions" />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
