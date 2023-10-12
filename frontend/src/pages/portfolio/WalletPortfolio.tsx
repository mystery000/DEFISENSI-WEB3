import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '../../layouts/AppLayout';
import NotificationsIcon from '@mui/icons-material/Notifications';

import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
} from '../../components/icons/defisensi-icons';
import { Asset } from '../../components/portfolio/asset';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
  getBalance,
  followWallet,
  getBalanceHistory,
  findWalletTransactions,
} from '../../lib/api';

import cn from 'classnames';
import * as Antd from 'antd';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { useAppContext } from '../../context/app';
import { balanceFormatter } from '../../lib/utils';
import { Transaction } from '../../types/transaction';
import { ChainSelection } from '../../components/ChainSelection';
import { EmptyContainer } from '../../components/EmptyContainer';
import useWalletPortfolio from '../../lib/hooks/useWalletPortfolio';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { NetworkType } from '../../types';

enum ContentType {
  PORTFOLIO = 'portfolio',
  TRANSACTIONS = 'transactions',
  ALL = 'all',
}

export const WalletPortfolio = () => {
  const { address } = useParams();
  const { user } = useAppContext();
  const [fetchMore, setFetchMore] = useState(false);
  const [following, setFollowing] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [notificationOn, setNotificationOn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chain, setChain] = useState<NetworkType>(NetworkType.ETHEREUM);
  const [selected, setSelected] = useState<ContentType>(ContentType.PORTFOLIO);

  const {
    data: portfolio,
    loading: loadingPortfolio,
    mutate: mutatePortfolio,
  } = useWalletPortfolio();

  // useEffect(() => {
  //   if (!address) return;
  //   const getTransactions = async () => {
  //     const balanceHistory = await getBalanceHistory(address);
  //     setBalanceHistory(balanceHistory);

  //     const wallet = await findWalletTransactions(address, 4);

  //     if (wallet) {
  //       const txns: Transaction[] = [];

  //       for (const txn of wallet.transactions) {
  //         txns.push({
  //           ...txn,
  //           address: wallet.address,
  //           comments: wallet.comments,
  //           likes: wallet.likes,
  //           dislikes: wallet.dislikes,
  //         });
  //       }

  //       if (txns.length % 4) setFetchMore(false);
  //       else setFetchMore(true);

  //       setTransactions(txns);
  //     }

  //     const balance = await getBalance(address);
  //     setBalance(balance);

  //     const tokens = [
  //       ...(balance?.binance?.tokens.map((token) => ({
  //         ...token,
  //         network: 'binance',
  //       })) || []),
  //       ...(balance?.ethereum?.tokens.map((token) => ({
  //         ...token,
  //         network: 'ethereum',
  //       })) || []),
  //       ...(balance?.polygon?.tokens.map((token) => ({
  //         ...token,
  //         network: 'polygon',
  //       })) || []),
  //     ].filter((token) => Number(token.value) !== 0);

  //     setTokensOfWallet(tokens);
  //     setSelectedToken(tokens[0]);
  //   };
  //   getTransactions();
  // }, [address]);

  // Detect whether screen is mobile or desktop size
  useEffect(() => {
    const breakpoint = 1536;
    window.innerWidth >= breakpoint
      ? setSelected(ContentType.ALL)
      : setSelected(ContentType.PORTFOLIO);
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
    if (!address) return;
    try {
      const wallet = await findWalletTransactions(
        address,
        transactions.length + 4,
      );

      if (!wallet) return;

      const txns: Transaction[] = [];

      for (const txn of wallet.transactions) {
        txns.push({
          ...txn,
          address: wallet.address,
          comments: wallet.comments,
          likes: wallet.likes,
          dislikes: wallet.dislikes,
        });
      }
      if (transactions.length === txns.length) setFetchMore(false);
      setTimeout(() => setTransactions(txns), 1500);
    } catch (error) {
      console.log(error);
    }
  }, [transactions, address]);

  const handleFollow = useCallback(async () => {
    if (!address || !user) return;
    try {
      setFollowing(true);
      await followWallet(user.address, address);
      mutatePortfolio({
        ...portfolio,
        followers: [...portfolio.followers, user.id],
      });
      setFollowing(false);
      toast.success('Followed!');
    } catch (error) {
      setFollowing(false);
      toast.error((error as any).message);
    }
  }, [address, user, portfolio, mutatePortfolio]);

  if (loadingPortfolio) {
    return (
      <div className="grid h-screen place-items-center">
        <Antd.Spin size="large" />
      </div>
    );
  }

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
            <h2 className="font-sora text-4xl font-semibold">
              {portfolio?.ens}
            </h2>
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
            <button
              className={cn('rounded bg-orange-400 px-4 py-[10px]', {
                hidden: user.address === address,
              })}
              onClick={handleFollow}
              disabled={following}
            >
              {following ? 'Following...' : 'Follow'}
            </button>
          </div>

          <div
            className="flex justify-end hover:cursor-pointer"
            onClick={() => setNotificationOn((state) => !state)}
          >
            {notificationOn ? <NotificationOnIcon /> : <NotificationsIcon />}
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
        <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
          {/* Portfolio */}
          <div
            className={cn('px-0 2xl:w-[808px]', {
              hidden:
                selected !== ContentType.PORTFOLIO &&
                selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">
              Portfolio
            </span>
            {/* Balance History */}
            <div className="w-full">
              <div className="flex justify-between bg-white p-4">
                <span className="font-sora text-2xl font-semibold">
                  Balance History
                </span>
                {/* <select
                  className="rounded border px-2 py-1 text-center"
                  defaultValue={tokensOfWallet[0]?.symbol}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const foundToken = tokensOfWallet.find(
                      (token) => token.symbol.toLowerCase() === e.target.value,
                    );
                    setSelectedToken(foundToken);
                  }}
                >
                  {tokensOfWallet.map((token) => (
                    <option value={token.symbol.toLowerCase()}>
                      <span className="font-inter text-lg">
                        {token.symbol.toUpperCase()}
                      </span>
                    </option>
                  ))}
                </select> */}
                <ChainSelection
                  value={chain}
                  onChange={(chain) => {
                    if (chain) setChain(chain.value);
                  }}
                />
              </div>
              {/* <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartComponentRef}
              /> */}
            </div>
            {/* Asset Overview */}
            <div className="mt-2 bg-white p-4">
              <div className="flex justify-between">
                <span className="text-sora text-xl font-semibold">
                  Asset Overview
                </span>
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-4">
                {/* <Asset
                  blockchain="All"
                  balance={balanceFormatter(
                    EtherValues + BinanceValues + PolygonValues,
                  )}
                  history={AllSparkLineData}
                />
                <Asset
                  blockchain="BNB Chain"
                  balance={balanceFormatter(BinanceValues)}
                  history={BinanceSparkLineData}
                />
                <Asset
                  blockchain="ETH"
                  balance={balanceFormatter(EtherValues)}
                  history={EthereumSparkLineData}
                />
                <Asset
                  blockchain="Polygon"
                  balance={balanceFormatter(PolygonValues)}
                  history={PolygonSparkLineData}
                /> */}
              </div>
              <TableContainer>
                <Table
                  sx={{ minWidth: 400, heigh: 600 }}
                  aria-label="simple table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                        Token
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                        Amount
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                        USD Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {tokensOfWallet.length > 0 ? (
                      tokensOfWallet.map((token, id) => (
                        <TableRow
                          key={token.name + id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <img
                                src={
                                  token.symbol.toLocaleLowerCase() === 'eth'
                                    ? `/images/tokens/eth.png`
                                    : token.logo
                                    ? token.logo
                                    : `/images/tokens/empty-eth.png`
                                }
                                width={32}
                                height={32}
                                alt="no icon"
                              />
                              {token.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {Number(token.value).toLocaleString()}
                          </TableCell>
                          <TableCell>${token.usdPrice}</TableCell>
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
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                          >
                            <EmptyContainer />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )} */}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          {/* Transaction */}
          <div
            className={cn('mx-auto 2xl:mx-0', {
              hidden:
                selected !== ContentType.TRANSACTIONS &&
                selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">
              Transactions
            </span>
            {transactions.length ? (
              <InfiniteScroll
                dataLength={transactions.length}
                next={fetchMoreTransactions}
                hasMore={fetchMore}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.txHash}
                    transaction={transaction}
                    likes={transaction.likes}
                    dislikes={transaction.dislikes}
                    comments={transaction.comments}
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
