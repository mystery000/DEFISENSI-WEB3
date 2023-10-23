import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import AppLayout from '../../layouts/AppLayout';
import InfiniteScroll from 'react-infinite-scroll-component';

import { FollowerIcon, FollowingIcon, NotificationOnIcon } from '../../components/icons/defisensi-icons';

import cn from 'classnames';
import { Spin } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import { followNFT } from '../../lib/api';
import { keyFormatter } from '../../lib/utils';
import { useAppContext } from '../../context/app';
import useNFTPortfolio from '../../lib/hooks/useNFTPortfolio';
import { NFTAsset } from '../../components/portfolio/NFTAsset';
import { EmptyContainer } from '../../components/EmptyContainer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NFTTransactionCard } from '../../components/transactions/NFTTransactionCard';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NFTTransaction, TransactionType } from '../../types/transaction';

enum ContentType {
  INFO = 'info',
  ACTIVITY = 'activity',
  ALL = 'all',
}

export const NFTPortfolio = () => {
  const { user } = useAppContext();
  const { network, address } = useParams();
  const [following, setFollowing] = useState(false);
  const [fetchMore, setFetchMore] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [noticationOn, setNotificationOn] = useState(false);
  const [selected, setSelected] = useState<ContentType>(ContentType.INFO);

  const { data: portfolio, loading: loadingPortfolio, mutate: mutatePortfolio } = useNFTPortfolio();

  const handleFollow = useCallback(async () => {
    if (!address || !network) return;
    try {
      setFollowing(true);
      await followNFT(user.address, address, network, portfolio.transactions);
      mutatePortfolio({
        ...portfolio,
        followers: [...portfolio.followers, user.address],
      });
      setFollowing(false);
      toast.success(`You've followed this nft: ${address}`);
    } catch (error) {
      setFollowing(false);
      toast.error((error as any).message);
    }
  }, [address, network, user, portfolio, mutatePortfolio]);

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

  const fetchMoreTransactions = useCallback(async () => {}, []);

  if (loadingPortfolio)
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );

  if (!address || !network) return;

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
            <h2 className="flex items-center justify-center gap-1 font-sora text-4xl font-semibold">
              <span>{portfolio.stats?.name}</span>
              <span className="flex items-center gap-2 rounded-lg bg-black px-2 py-[3px] text-sm font-light text-white">
                <img
                  src={`/images/network/${network}.png`}
                  width={32}
                  height={32}
                  alt="noicon"
                  className="rounded-full"
                ></img>
                <span>{`on ${network[0].toUpperCase() + network.slice(1)}`}</span>
              </span>
            </h2>
            <span className="mt-4 text-sm font-medium">
              {address.slice(0, 11)}.........{address.slice(-13)}
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
            <button className="rounded bg-orange-400 px-4 py-[10px]" onClick={handleFollow} disabled={following}>
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
        <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
          {/* Info */}
          <div
            className={cn('px-0 2xl:w-[808px]', {
              hidden: selected !== ContentType.INFO && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Info</span>
            {/* Sale Volume History */}
            <div className="bg-white">
              <div className="flex justify-between p-4 font-sora text-2xl font-semibold">Sale Volume History</div>
              <ResponsiveContainer height={430} width="100%">
                <AreaChart
                  data={(portfolio.stats?.sale_volumes || []).sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )}
                  margin={{ top: 10, right: 50, left: 50, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3354F4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6359E8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    interval={Math.floor((portfolio.stats?.sale_volumes || []).length / 3)}
                    tickFormatter={(date) => moment(date).format('YYYY-MM-DD')}
                    axisLine={false}
                  />
                  <YAxis orientation="right" axisLine={false} tickLine={false} tickFormatter={keyFormatter} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#8884d8" fillOpacity={1} fill="url(#volume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* NFT Overview */}
            <div className="mt-2 bg-white p-4">
              <div className="mt-2 flex flex-wrap justify-between gap-4">
                <NFTAsset
                  chainName="Current Value"
                  value={portfolio.stats?.volume}
                  symbol={portfolio.stats?.floor_price_symbol}
                />
                <NFTAsset chainName="Total Holders" value={portfolio.stats?.holders.toString()} />
                <NFTAsset
                  chainName={network}
                  value={portfolio.stats?.floor_price.toString()}
                  symbol={portfolio.stats?.floor_price_symbol}
                />
              </div>
            </div>
          </div>
          {/* Transaction */}
          <div
            className={cn('mx-auto 2xl:mx-0', {
              hidden: selected !== ContentType.ACTIVITY && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Activity</span>

            {portfolio.transactions.length ? (
              <InfiniteScroll
                dataLength={portfolio.transactions.length}
                next={fetchMoreTransactions}
                hasMore={fetchMore}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {portfolio.transactions.map((transaction) => (
                  <NFTTransactionCard
                    key={transaction.txHash}
                    txn={transaction}
                    transactionType={TransactionType.NFT}
                    mutate={mutatePortfolio}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContainer descirption="No Transactions" />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
