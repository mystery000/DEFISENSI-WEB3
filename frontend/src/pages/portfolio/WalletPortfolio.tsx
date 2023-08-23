import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import AppLayout from '../../layouts/AppLayout';
import { useAppContext } from '../../context/app';

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
import { Balance, BalanceHistory, TokenBalance } from '../../types/balance';

import {
  findWalletTransactions,
  getBalance,
  getBalanceHistory,
} from '../../lib/api';

import { balanceFormatter } from '../../lib/utils';
import { Transaction } from '../../types/transaction';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { useParams } from 'react-router-dom';
import cn from 'classnames';
import Select from 'react-select';
import * as Antd from 'antd';

enum ContentType {
  PORTFOLIO = 'portfolio',
  TRANSACTIONS = 'transactions',
  ALL = 'all',
}

const options = [
  {
    value: 'ethereum',
    name: 'ethereum',
    label: 'ETH',
    logo: '../images/tokens/eth.png',
  },
  {
    value: 'polygon',
    name: 'polygon',
    label: 'POLYGON',
    logo: '../images/tokens/eth.png',
  },
];

const formatOptionLabel = ({
  label,
  logo,
}: {
  label: string;
  logo: string;
}) => (
  <div className="flex items-center gap-2">
    <img src={logo} width={24} height={24} alt="noLogo" />
    <div>{label}</div>
  </div>
);

interface PortfolioProps {
  className?: string;
}

export const WalletPortfolio: FC<PortfolioProps> = ({ className }) => {
  // const { address } = useParams();

  const { user } = useAppContext();
  const [width, setWidth] = useState(window.innerWidth);
  const [selected, setSelected] = useState<ContentType>(ContentType.PORTFOLIO);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const [fetchMore, setFetchMore] = useState(false);
  const [balance, setBalance] = useState<Balance>({});
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  const [selectedToken, setSelectedToken] = useState<
    TokenBalance & { network: string }
  >();

  const [tokensOfWallet, setTokensOfWallet] = useState<
    (TokenBalance & { network: string })[]
  >([]);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const wallet = await findWalletTransactions(user.address, 4);

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

        if (txns.length % 4) setFetchMore(false);
        else setFetchMore(true);

        setTransactions(txns);

        const balance = await getBalance(user.address);
        setBalance(balance || {});

        const tokens = [
          ...(balance?.binance?.tokens.map((token) => ({
            ...token,
            network: 'binance',
          })) || []),
          ...(balance?.ethereum?.tokens.map((token) => ({
            ...token,
            network: 'ethereum',
          })) || []),
          ...(balance?.polygon?.tokens.map((token) => ({
            ...token,
            network: 'polygon',
          })) || []),
        ].filter((token) => Number(token.value) !== 0);

        setTokensOfWallet(tokens);
        setSelectedToken(tokens[0]);

        const balanceHistory = await getBalanceHistory(user.address);
        setBalanceHistory(balanceHistory || {});
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, []);

  useEffect(() => {
    if (!selectedToken) return;
    setChartOptions((prev) => {
      if (Object.hasOwn(balanceHistory, selectedToken.network)) {
        let data: any[] = [];

        for (const [key, value] of Object.entries(balanceHistory)) {
          if (key === selectedToken.network) {
            data = value.map((history) => {
              const foundToken = history.tokens.find(
                (token) =>
                  token.symbol.toLowerCase() ===
                  selectedToken.symbol.toLowerCase(),
              );
              return [
                new Date(history.timestamp).getTime(),
                Number(foundToken?.usdPrice),
              ];
            });
          }
        }
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
      } else {
        return defaultOption;
      }
    });
  }, [balanceHistory, selectedToken]);

  // Detect whether screen is mobile or desktop size
  useEffect(() => {
    const breakpoint = 1536;
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
    try {
      const wallet = await findWalletTransactions(
        user.address,
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
  }, [transactions]);

  const EtherValues =
    balance.ethereum?.tokens.reduce(
      (sum, token) => sum + Number(token.usdPrice),
      0,
    ) || 0;

  const PolygonValues =
    balance.polygon?.tokens.reduce(
      (sum, token) => sum + Number(token.usdPrice),
      0,
    ) || 0;

  const BinanceValues =
    balance.binance?.tokens.reduce(
      (sum, token) => sum + Number(token.usdPrice),
      0,
    ) || 0;

  const BinanceSparkLineData =
    balanceHistory.binance?.map(
      (balance) =>
        balance.tokens.reduce(
          (sum, token) => sum + Number(token.usdPrice),
          0,
        ) || 0,
    ) || [];

  const EthereumSparkLineData =
    balanceHistory.ethereum?.map(
      (balance) =>
        balance.tokens.reduce(
          (sum, token) => sum + Number(token.usdPrice),
          0,
        ) || 0,
    ) || [];

  const PolygonSparkLineData =
    balanceHistory.polygon?.map(
      (balance) =>
        balance.tokens.reduce(
          (sum, token) => sum + Number(token.usdPrice),
          0,
        ) || 0,
    ) || [];

  const AllSparkLineData = EthereumSparkLineData.map(
    (val, i) => val + PolygonSparkLineData[i] + BinanceSparkLineData[i],
  );

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
            <h2 className="font-sora text-4xl font-semibold">Aliashraf.eth</h2>
            <span className="mt-4 text-sm font-medium">
              {user.address.slice(0, 11)}.........{user.address.slice(-13)}
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
                <Select
                  defaultValue={options[0]}
                  formatOptionLabel={formatOptionLabel}
                  options={options}
                />
              </div>
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartComponentRef}
              />
            </div>
            {/* Asset Overview */}
            <div className="mt-2 bg-white p-4">
              <div className="flex justify-between">
                <span className="text-sora text-xl font-semibold">
                  Asset Overview
                </span>
                <Antd.Select
                  defaultValue="day"
                  style={{ width: 120 }}
                  options={[
                    { value: 'hour', label: '1 hour' },
                    { value: 'day', label: '1 day' },
                    { value: 'month', label: '1 month' },
                    { value: 'year', label: '1 year' },
                  ]}
                />
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-4">
                <Asset
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
                />
              </div>
              <TableContainer>
                <Table sx={{ minWidth: 400 }} aria-label="simple table">
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
                    {tokensOfWallet.map((token, id) => (
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
                                token.symbol.toLocaleLowerCase() == 'eth'
                                  ? `../images/tokens/eth.png`
                                  : token.logo
                                  ? token.logo
                                  : `../images/tokens/empty-eth.png`
                              }
                              width={32}
                              height={32}
                              alt="no icon"
                            />
                            {token.name}
                          </div>
                        </TableCell>
                        <TableCell>{token.value}</TableCell>
                        <TableCell>${token.usdPrice}</TableCell>
                      </TableRow>
                    ))}
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