import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import AppLayout from '../../layouts/AppLayout';
import TableContainer from '@mui/material/TableContainer';
import InfiniteScroll from 'react-infinite-scroll-component';

import cn from 'classnames';
import moment from 'moment';
import { Image, Spin } from 'antd';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { NetworkType } from '../../types';
import { followWallet } from '../../lib/api';
import { keyFormatter } from '../../lib/utils';
import { useAppContext } from '../../context/app';
import { Asset } from '../../components/portfolio/Asset';
import { ChainSelection } from '../../components/ChainSelection';
import { EmptyContainer } from '../../components/EmptyContainer';
import useWalletBalances from '../../lib/hooks/useWalletBalances';
import useWalletPortfolio from '../../lib/hooks/useWalletPortfolio';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { FollowerIcon, FollowingIcon } from '../../components/icons/defisensi-icons';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { NFTTransactionCard } from '../../components/transactions/NFTTransactionCard';
import { NFTTransaction, TokenTransaction, TransactionType } from '../../types/transaction';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';

enum ContentType {
  PORTFOLIO = 'portfolio',
  TRANSACTIONS = 'transactions',
  ALL = 'all',
}
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-gray-300 bg-white p-4">
        <p>{label}</p>
        <p className="text-indigo-400">{`${payload?.[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export const WalletPortfolio = () => {
  const { address } = useParams();
  const { user } = useAppContext();
  const [fetchMore, setFetchMore] = useState(false);
  const [following, setFollowing] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [chain, setChain] = useState<NetworkType>(NetworkType.ETHEREUM);
  const [selected, setSelected] = useState<ContentType>(ContentType.PORTFOLIO);

  const { balances, loading: balancesLoading } = useWalletBalances(chain);
  const { data: portfolio, loading: portfolioLoading, mutate: mutatePortfolio } = useWalletPortfolio();

  // Responsive Design
  useEffect(() => {
    const breakpoint = 1536;
    window.innerWidth >= breakpoint ? setSelected(ContentType.ALL) : setSelected(ContentType.PORTFOLIO);
    const handleWindowResize = () => {
      if (width < breakpoint && window.innerWidth >= breakpoint) {
        setSelected(ContentType.ALL);
      } else if (width >= breakpoint && window.innerWidth < breakpoint) {
        setSelected(ContentType.PORTFOLIO);
      }
      setWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [width]);

  const fetchMoreTransactions = useCallback(async () => {
    return portfolio.transactions;
  }, [portfolio]);

  const handleFollow = useCallback(async () => {
    if (!address || !user) return;
    try {
      setFollowing(true);
      await followWallet(user.address, address, portfolio.transactions);
      mutatePortfolio({
        ...portfolio,
        followers: [...portfolio.followers, { address: user.address }],
      });
      setFollowing(false);
      toast.success(`You've followed this wallet ${address}`);
    } catch (error) {
      setFollowing(false);
      toast.error((error as any).message);
    }
  }, [address, user, portfolio, mutatePortfolio]);

  if (portfolioLoading || balancesLoading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }
  const data = portfolio.historicalBalances?.[`${chain}`]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((price) => ({
      date: new Date(price.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      total_quote: Number(price?.total_quote || 0),
      pretty_total_quote: price?.pretty_total_quote || '0',
    }));

  const arrays = Object.values(portfolio.historicalBalances || {}).map((balances) => balances);
  const maxLength = arrays.length > 0 ? Math.max(...arrays.map((arr) => arr.length)) : 0;
  const sum = Array(maxLength)
    .fill(0)
    .map((_, idx) => arrays.reduce((acc, currentArray) => acc + (Number(currentArray[idx]?.total_quote) || 0), 0));

  return (
    <AppLayout>
      <div className="w-full font-inter md:mx-auto md:w-2/3 2xl:w-fit">
        {/* Header */}
        <div
          className="p-6 text-center"
          style={{
            background: 'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <h2 className="font-sora text-4xl font-semibold">{portfolio?.ens}</h2>
            <span className="mt-4 text-sm font-medium" title={address}>
              {address?.slice(0, 11)}.........{address?.slice(-10)}
            </span>
          </div>
          <div className="mt-5 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FollowingIcon />
              <span>{portfolio.followers.length}</span>
              <span className="text-bali-hai-600">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <FollowerIcon />
              <span>{portfolio.followings.length}</span>
              <span className="text-bali-hai-600">Followers</span>
            </div>
          </div>
          <div className="mt-5 text-white">
            {portfolio.followers.findIndex((follower) => follower.address === user.address) > -1 ? (
              <button
                className={cn('rounded bg-orange-400 px-4 py-[10px] font-bold', {
                  hidden: user.address === address,
                })}
                disabled
              >
                Following
              </button>
            ) : (
              <button
                className={cn('rounded bg-orange-400 px-4 py-[10px] font-bold', {
                  hidden: user.address === address,
                })}
                onClick={handleFollow}
                disabled={following}
              >
                {following ? 'Following...' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex justify-start gap-6 bg-white px-4 py-6 font-sora text-[32px] 2xl:hidden ">
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.PORTFOLIO,
            })}
            onClick={() => setSelected(ContentType.PORTFOLIO)}
          >
            Portfolio
          </span>
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.TRANSACTIONS,
            })}
            onClick={() => setSelected(ContentType.TRANSACTIONS)}
          >
            Transactions
          </span>
        </div>
        {/* Main */}
        <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
          {/* Portfolio */}
          <div
            className={cn('px-0 2xl:w-[808px]', {
              hidden: selected !== ContentType.PORTFOLIO && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Portfolio</span>
            {/* Balance History */}
            <div className="w-full bg-white">
              <div className="flex justify-between p-4">
                <span className="font-sora text-2xl font-semibold">Balance History</span>
                <ChainSelection
                  value={chain}
                  onChange={(chain) => {
                    if (chain) setChain(chain.value);
                  }}
                />
              </div>
              <ResponsiveContainer height={430} width="100%">
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="quote" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3354F4" stopOpacity={0.8} />
                      <stop offset="85%" stopColor="#6359E8" stopOpacity={0} />
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total_quote" stroke="#8884d8" fillOpacity={1} fill="url(#quote)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Asset Overview */}
            <div className="mt-2 bg-white p-4">
              <div className="flex justify-between">
                <span className="text-sora text-xl font-semibold">Asset Overview</span>
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-4">
                <Asset chainName="All" data={sum} />
                <Asset
                  chainName="ETH"
                  data={portfolio.historicalBalances?.ethereum.map((balance) => Number(balance.total_quote))}
                />
                <Asset
                  chainName="Polygon"
                  data={portfolio.historicalBalances?.polygon.map((balance) => Number(balance.total_quote))}
                />
                <Asset
                  chainName="BNB Smart Chain"
                  data={portfolio.historicalBalances?.binance.map((balance) => Number(balance.total_quote))}
                />
                <Asset
                  chainName="Arbitrum"
                  data={portfolio.historicalBalances?.arbitrum.map((balance) => Number(balance.total_quote))}
                />
                <Asset
                  chainName="Avalanche"
                  data={portfolio.historicalBalances?.avalanche.map((balance) => Number(balance.total_quote))}
                />
              </div>
              <TableContainer>
                <Table sx={{ minWidth: 400, heigh: 600 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Token</TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Amount</TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>USD Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balances.length > 0 ? (
                      balances.map((token, id) => (
                        <TableRow
                          key={token.contract_address}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                          hover
                        >
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Image
                                alt="#"
                                src={`/images/tokens/${token.contract_ticker_symbol?.toUpperCase()}.png`}
                                fallback={`/images/tokens/default/empty-ethereum.png`}
                                width={24}
                                height={24}
                                loading="lazy"
                                preview={false}
                              />
                              {token.contract_ticker_symbol}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(Number(token.balance) / 10 ** token.contract_decimals).toLocaleString()}
                          </TableCell>
                          <TableCell>{token.pretty_quote}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
                          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <EmptyContainer />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          {/* Transaction */}
          <div
            className={cn('mx-auto 2xl:mx-0', {
              hidden: selected !== ContentType.TRANSACTIONS && selected !== ContentType.ALL,
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
                {portfolio.transactions.map((transaction) => {
                  if (transaction.type === TransactionType.NFT) {
                    return (
                      <NFTTransactionCard
                        key={transaction?.txHash}
                        txn={transaction as NFTTransaction}
                        transactionType={TransactionType.WALLET}
                        mutate={mutatePortfolio}
                      />
                    );
                  } else if (transaction.type === TransactionType.TOKEN) {
                    return (
                      <TransactionCard
                        key={transaction?.txHash}
                        txn={transaction as TokenTransaction}
                        transactionType={TransactionType.WALLET}
                        mutate={mutatePortfolio}
                      />
                    );
                  }
                })}
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
