import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '../../layouts/AppLayout';
import { Asset } from '../../components/portfolio/asset';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
} from '../../components/icons/defisensi-icons';

import cn from 'classnames';
import { Spin } from 'antd';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../context/app';
import { balanceFormatter } from '../../lib/utils';
import { NftTransfer } from '../../types/transaction';
import { followNFT, getNFTTransactions } from '../../lib/api';
import useNFTPortfolio from '../../lib/hooks/useNFTPortfolio';
import { EmptyContainer } from '../../components/EmptyContainer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useNFTTransactions from '../../lib/hooks/useNFTTransactions';
import { NFTTransactionCard } from '../../components/transactions/NFTTransactionCard';

enum ContentType {
  INFO = 'info',
  ACTIVITY = 'activity',
  ALL = 'all',
}

export const NFTPortfolio = () => {
  return <></>;
  // const { user } = useAppContext();
  // const { network, address } = useParams();
  // const [following, setFollowing] = useState(false);
  // const [fetchMore, setFetchMore] = useState(false);
  // const [balance, setBalance] = useState<Balance>({});
  // const [width, setWidth] = useState(window.innerWidth);
  // const [noticationOn, setNotificationOn] = useState(false);
  // const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  // const [selected, setSelected] = useState<ContentType>(ContentType.INFO);
  // const [balanceHistory, setBalanceHistory] = useState<BalanceHistory>({});
  // const {
  //   transactions,
  //   loading: loadingTransactions,
  //   mutateTransactions,
  // } = useNFTTransactions();

  // const {
  //   data: portfolio,
  //   loading: loadingPortfolio,
  //   mutate: mutatePortfolio,
  // } = useNFTPortfolio();

  // const [selectedToken, setSelectedToken] = useState<
  //   TokenBalance & { network: string }
  // >();

  // const [tokensOfWallet, setTokensOfWallet] = useState<
  //   (TokenBalance & { network: string })[]
  // >([]);

  // const handleFollow = useCallback(async () => {
  //   if (!address || !network) return;
  //   try {
  //     setFollowing(true);
  //     await followNFT(user.address, address, network);
  //     mutatePortfolio({
  //       ...portfolio,
  //       followers: [...portfolio.followers, user.id],
  //     });
  //     setFollowing(false);
  //     toast.success('Followed!');
  //   } catch (error) {
  //     setFollowing(false);
  //     toast.error((error as any).message);
  //   }
  // }, [address, network, user, portfolio, mutatePortfolio]);

  // useEffect(() => {
  //   if (!selectedToken) return;
  //   setChartOptions((prev) => {
  //     if (Object.hasOwn(balanceHistory, selectedToken.network)) {
  //       let data: any[] = [];

  //       for (const [key, value] of Object.entries(balanceHistory)) {
  //         if (key === selectedToken.network) {
  //           data = value.map((history) => {
  //             const foundToken = history.tokens.find(
  //               (token) =>
  //                 token.symbol.toLowerCase() ===
  //                 selectedToken.symbol.toLowerCase(),
  //             );
  //             return [
  //               new Date(history.timestamp).getTime(),
  //               Number(foundToken?.usdPrice),
  //             ];
  //           });
  //         }
  //       }
  //       return {
  //         ...defaultOption,
  //         series: [
  //           {
  //             type: 'area',
  //             color: {
  //               linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
  //               stops: [
  //                 [0, '#ffffff'],
  //                 [1, '#3354F4'],
  //               ],
  //             },
  //             lineColor: '#3354F4',
  //             data: data,
  //           },
  //         ],
  //       };
  //     } else {
  //       return defaultOption;
  //     }
  //   });
  // }, [balanceHistory, selectedToken, defaultOption]);

  // // Detect whether screen is mobile or desktop size
  // useEffect(() => {
  //   const breakpoint = 1536;
  //   window.innerWidth >= breakpoint
  //     ? setSelected(ContentType.ALL)
  //     : setSelected(ContentType.INFO);
  //   const handleWindowResize = () => {
  //     if (width < breakpoint && window.innerWidth >= breakpoint) {
  //       setSelected(ContentType.ALL);
  //     } else if (width >= breakpoint && window.innerWidth < breakpoint) {
  //       setSelected(ContentType.INFO);
  //     }
  //     setWidth(window.innerWidth);
  //   };
  //   window.addEventListener('resize', handleWindowResize);
  //   return () => window.removeEventListener('resize', handleWindowResize);
  // }, [width]);

  // const fetchMoreTransactions = useCallback(async () => {
  //   if (!address || !network) return;
  //   try {
  //     const nft = await getNFTTransactions(
  //       network,
  //       address,
  //       transactions.length + 4,
  //     );

  //     if (!nft) return;

  //     const txns: NftTransfer[] = [];

  //     for (const txn of nft.transactions) {
  //       txns.push({
  //         ...txn,
  //         address: nft.address,
  //         comments: nft.comments,
  //         likes: nft.likes,
  //         dislikes: nft.dislikes,
  //       });
  //     }
  //     if (transactions.length === txns.length) setFetchMore(false);
  //     setTimeout(() => mutateTransactions(txns), 1500);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [transactions, address, network, mutateTransactions]);

  // if (loadingTransactions || loadingPortfolio)
  //   return (
  //     <div className="grid h-screen place-items-center">
  //       <Spin size="large" />
  //     </div>
  //   );

  // const EtherValues =
  //   balance.ethereum?.tokens.reduce(
  //     (sum, token) => sum + Number(token.usdPrice),
  //     0,
  //   ) || 0;

  // const PolygonValues =
  //   balance.polygon?.tokens.reduce(
  //     (sum, token) => sum + Number(token.usdPrice),
  //     0,
  //   ) || 0;

  // const BinanceValues =
  //   balance.binance?.tokens.reduce(
  //     (sum, token) => sum + Number(token.usdPrice),
  //     0,
  //   ) || 0;

  // const BinanceSparkLineData =
  //   balanceHistory.binance?.map(
  //     (balance) =>
  //       balance.tokens.reduce(
  //         (sum, token) => sum + Number(token.usdPrice),
  //         0,
  //       ) || 0,
  //   ) || [];

  // const EthereumSparkLineData =
  //   balanceHistory.ethereum?.map(
  //     (balance) =>
  //       balance.tokens.reduce(
  //         (sum, token) => sum + Number(token.usdPrice),
  //         0,
  //       ) || 0,
  //   ) || [];

  // const PolygonSparkLineData =
  //   balanceHistory.polygon?.map(
  //     (balance) =>
  //       balance.tokens.reduce(
  //         (sum, token) => sum + Number(token.usdPrice),
  //         0,
  //       ) || 0,
  //   ) || [];

  // const AllSparkLineData = EthereumSparkLineData.map(
  //   (val, i) => val + PolygonSparkLineData[i] + BinanceSparkLineData[i],
  // );

  // if (!address || !network) return;

  // return (
  //   <AppLayout>
  //     <div className="w-full font-inter md:mx-auto md:w-2/3 2xl:w-fit">
  //       <div
  //         className="p-6 text-center"
  //         style={{
  //           background:
  //             'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
  //         }}
  //       >
  //         <div>
  //           <h2 className="flex items-center justify-center gap-1 font-sora text-4xl font-semibold">
  //             <span>AZUKI</span>
  //             <span className="flex items-center gap-2 rounded-lg bg-black px-2 py-[3px] text-sm font-light text-white">
  //               <img
  //                 src={`/images/network/${network}.png`}
  //                 width={32}
  //                 height={32}
  //                 alt="noicon"
  //               ></img>
  //               <span>{`on ${
  //                 network[0].toUpperCase() + network.slice(1)
  //               }`}</span>
  //             </span>
  //           </h2>
  //           <span className="mt-4 text-sm font-medium">
  //             {address.slice(0, 11)}.........{address.slice(-13)}
  //           </span>
  //         </div>
  //         <div className="mt-5 flex justify-center gap-4 text-sm">
  //           <div className="flex items-center gap-1">
  //             <FollowingIcon />
  //             <span>{portfolio.followings.length}</span>
  //             <span className="text-bali-hai-600">Following</span>
  //           </div>
  //           <div className="flex items-center gap-1">
  //             <FollowerIcon />
  //             <span>{portfolio.followers.length}</span>
  //             <span className="text-bali-hai-600">Followers</span>
  //           </div>
  //         </div>
  //         <div className="mt-5 text-white">
  //           <button
  //             className="rounded bg-orange-400 px-4 py-[10px]"
  //             onClick={handleFollow}
  //             disabled={following}
  //           >
  //             {following ? 'Following...' : 'Follow'}
  //           </button>
  //         </div>

  //         <div
  //           className="flex justify-end hover:cursor-pointer"
  //           onClick={() => setNotificationOn((state) => !state)}
  //         >
  //           {noticationOn ? <NotificationOnIcon /> : <NotificationsIcon />}
  //         </div>
  //       </div>
  //       <div className="mt-2 flex justify-start gap-6 bg-white px-4 py-6 font-sora text-[32px] 2xl:hidden ">
  //         <span
  //           className={cn('leading-8', {
  //             'text-orange-400': selected === ContentType.INFO,
  //           })}
  //           onClick={() => setSelected(ContentType.INFO)}
  //         >
  //           Info
  //         </span>
  //         <span
  //           className={cn('leading-8', {
  //             'text-orange-400': selected === ContentType.ACTIVITY,
  //           })}
  //           onClick={() => setSelected(ContentType.ACTIVITY)}
  //         >
  //           Activity
  //         </span>
  //       </div>
  //       <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
  //         {/* Info */}
  //         <div
  //           className={cn('px-0 2xl:w-[808px]', {
  //             hidden:
  //               selected !== ContentType.INFO && selected !== ContentType.ALL,
  //           })}
  //         >
  //           <span className="hidden font-sora text-[32px] 2xl:block">Info</span>
  //           {/* Sale Volume History */}
  //           <div className="w-full">
  //             <div className="bg-white p-4 font-sora text-2xl font-semibold">
  //               Sale Volume History
  //             </div>
  //             <HighchartsReact
  //               highcharts={Highcharts}
  //               options={chartOptions}
  //               ref={chartComponentRef}
  //             />
  //           </div>
  //           {/* NFT Overview */}
  //           <div className="mt-2 bg-white p-4">
  //             <div className="mt-2 flex flex-wrap justify-between gap-4">
  //               <Asset
  //                 blockchain="Current Value"
  //                 balance={balanceFormatter(
  //                   EtherValues + BinanceValues + PolygonValues,
  //                 )}
  //                 history={AllSparkLineData}
  //               />
  //               <Asset
  //                 blockchain="Total Assets"
  //                 balance={balanceFormatter(BinanceValues)}
  //                 history={BinanceSparkLineData}
  //               />
  //               <Asset
  //                 blockchain="Total Holders"
  //                 balance={balanceFormatter(EtherValues)}
  //                 history={EthereumSparkLineData}
  //               />
  //               <Asset
  //                 blockchain="Polygon"
  //                 balance={balanceFormatter(PolygonValues)}
  //                 history={PolygonSparkLineData}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //         {/* Transaction */}
  //         <div
  //           className={cn('mx-auto 2xl:mx-0', {
  //             hidden:
  //               selected !== ContentType.ACTIVITY &&
  //               selected !== ContentType.ALL,
  //           })}
  //         >
  //           <span className="hidden font-sora text-[32px] 2xl:block">
  //             Activity
  //           </span>

  //           {transactions.length ? (
  //             <InfiniteScroll
  //               dataLength={transactions.length}
  //               next={fetchMoreTransactions}
  //               hasMore={fetchMore}
  //               loader={<h4 className="text-center">Loading...</h4>}
  //             >
  //               {transactions.map((transaction) => (
  //                 <NFTTransactionCard
  //                   key={transaction.txHash}
  //                   transaction={transaction}
  //                   likes={transaction.likes}
  //                   dislikes={transaction.dislikes}
  //                   comments={transaction.comments}
  //                 />
  //               ))}
  //             </InfiniteScroll>
  //           ) : (
  //             <EmptyContainer descirption="no transactions" />
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </AppLayout>
  // );
};
