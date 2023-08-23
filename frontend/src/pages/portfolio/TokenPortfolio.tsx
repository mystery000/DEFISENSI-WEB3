import { useParams } from 'react-router-dom';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

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
import { getPriceHistory, getTokenTransactions } from '../../lib/api';
import { Transaction } from '../../types/transaction';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { NetworkType } from '../../types';
import usePriceHistory from '../../lib/hooks/usePriceHistory';
import useTokenTransactions from '../../lib/hooks/useTokenTransactions';
import usePriceFromExchanges from '../../lib/hooks/usePriceFromExchanges';

enum ContentType {
  INFO = 'info',
  ACTIVITY = 'activity',
  ALL = 'all',
}

interface TokenPortfolioProps {
  classname?: string;
}

export const TokenPortfolio: FC<TokenPortfolioProps> = ({ classname }) => {
  const { network, contractAddress } = useParams();

  const [width, setWidth] = useState(window.innerWidth);
  const [selected, setSelected] = useState<ContentType>(ContentType.ALL);
  const { priceHistory, loading } = usePriceHistory();
  const { exchangePrice } = usePriceFromExchanges();
  const { transactions, mutateTransactions } = useTokenTransactions();

  const [fetchMore, setFetchMore] = useState(false);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const defaultOption: Highcharts.Options = {
    // title: {
    //   text: 'Balance History',
    //   style: {
    //     fontFamily: 'Sora',
    //     fontSize: '24px',
    //     fontWeight: '600',
    //     fontColor: '#000',
    //   },
    //   align: 'left',
    // },
    title: { text: '' },
    legend: {
      enabled: false, // Set this to false to disable the legend
    },
    credits: {
      enabled: false, // Set this to false to disable the credits
    },
    xAxis: {
      type: 'datetime',
      lineColor: '#F0F0F0',
      tickColor: '#F0F0F0',
      labels: {
        style: {
          color: '#33323A',
          fontSize: '14px',
          fontWeight: '600',
        },
        formatter: function () {
          return Highcharts.dateFormat('%d/%m/%y %H:%M', Number(this.value));
        },
      },
    },
    yAxis: {
      type: 'logarithmic',
      opposite: true,
      title: {
        text: '',
      },
      labels: {
        style: {
          color: '#77838F',
          fontSize: '14px',
          fontWeight: '400',
        },
        formatter: function () {
          let value = Number(this.value);
          if (value >= 1e9) {
            return '$' + value / 1e9 + 'B';
          } else if (value >= 1e6) {
            return '$' + value / 1e6 + 'M';
          } else if (value >= 1e3) {
            return '$' + value / 1e3 + 'K';
          } else {
            return '$' + value;
          }
        },
      },
    },
    tooltip: {
      backgroundColor: 'black',
      borderWidth: 0,
      borderRadius: 0,
      shadow: false,
      style: {
        fontFamily: 'Sora',
        fontSize: '12px',
        fontWeight: '400',
        lineHeight: '12px',
        letterSpacing: '-0.02em',
        textAlign: 'right',
        color: 'white',
      },
      shape: 'callout', // Use the callout shape (custom SVG path)
      positioner: function (width, height, point) {
        const chart = this.chart;
        const tooltipX = point.plotX + chart.plotLeft - width - 10; // Adjust tooltipX to move it leftward
        const tooltipY = point.plotY + chart.plotTop - 50; // Adjust tooltipY to move it upward
        return { x: tooltipX, y: tooltipY };
      },
      formatter: function () {
        let yValue: string | number = Number(this.y);
        if (yValue >= 1e9) {
          yValue = '$' + yValue / 1e9 + 'B';
        } else if (yValue >= 1e6) {
          yValue = '$' + yValue / 1e6 + 'M';
        } else if (yValue >= 1e3) {
          yValue = '$' + yValue / 1e3 + 'K';
        } else {
          yValue = '$' + yValue;
        }
        const xValue = Highcharts.dateFormat('%e %b %Y', Number(this.x));
        // Format the tooltip with x and y values
        return `<span style=" font-size: 12px; ">${yValue}</span><br/><span>${xValue}</span>`;
      },
    },
    chart: {
      zooming: {
        type: 'x',
        mouseWheel: true,
      },
    },
    series: [
      {
        type: 'area',
        color: {
          linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
          stops: [
            [0, '#ffffff'],
            [1, '#3354F4'],
          ],
        },
        lineColor: '#3354F4',
        data: [],
      },
    ],
  };

  const [chartOptions, setChartOptions] = useState(defaultOption);

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
      setTimeout(() => mutateTransactions(txns), 1500);
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

  useEffect(() => {
    if (!priceHistory) return;
    setChartOptions((prev) => {
      let data: any[] = [];

      data = priceHistory.map((history) => {
        return [new Date(history.updated_at).getTime(), Number(history.price)];
      });
      return {
        ...defaultOption,
        series: [
          {
            type: 'area',
            color: {
              linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
              stops: [
                [0, '#ffffff'],
                [1, '#3354F4'],
              ],
            },
            lineColor: '#3354F4',
            data: data,
          },
        ],
      };
    });
  }, [priceHistory]);

  if (!contractAddress) return;

  if (!exchangePrice)
    return <div className="text-center">Invalid Token Address</div>;

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
              <span>{exchangePrice.tokenName}</span>
              <span className="flex items-center gap-2 rounded-lg bg-black px-2 py-[3px] text-sm font-light text-white">
                <img
                  src="../../../images/tokens/eth.png"
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
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartComponentRef}
              />
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
                          <span className="flex items-center gap-2 rounded-lg bg-bali-hai-600/20 px-2 py-1">
                            <img
                              src="/images/tokens/eth.png"
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
                            src="/images/platforms/uni.png"
                            width={32}
                            height={32}
                            className="rounded-full border"
                            alt="platform_icon"
                          ></img>
                          <span>Uniswap</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '18px' }}>
                        {exchangePrice.usdPrice.uniswap
                          ? `$${exchangePrice.usdPrice.uniswap}`
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
                        {exchangePrice.usdPrice.binance
                          ? `$${exchangePrice.usdPrice.binance}`
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
                        {exchangePrice.usdPrice.kucoin
                          ? `$${exchangePrice.usdPrice.kucoin}`
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
                        {exchangePrice.usdPrice.coinbase
                          ? `$${exchangePrice.usdPrice.coinbase}`
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
