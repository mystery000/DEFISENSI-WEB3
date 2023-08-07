import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import AppLayout from "../layouts/AppLayout";
import { useAppContext } from "../context/app";

import {
  FollowerIcon,
  FollowingIcon,
  NotificationOnIcon,
} from "../components/icons/defisensi-icons";
import { Asset } from "../components/portfolio/asset";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { ExtendedTransaction } from "./Transasctions";
import TableContainer from "@mui/material/TableContainer";
import InfiniteScroll from "react-infinite-scroll-component";
import { Balance, BalanceHistory, TokenBalance } from "../types/balance";
import { TransactionDetailsCard } from "../components/transactions/TransactionDetailsCard";
import {
  findWalletTransactions,
  getBalance,
  getBalanceHistory,
} from "../lib/api";
import { balanceFormatter } from "../lib/utils";
interface AssetProps {
  className?: string;
}

export const Portfolio: FC<AssetProps> = ({ className }) => {
  const { user } = useAppContext();
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const [fetchMore, setFetchMore] = useState(true);
  const [balance, setBalance] = useState<Balance>({});
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory>({});
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const defaultOption: Highcharts.Options = {
    // title: {
    //   text: "Balance History",
    //   style: {
    //     fontFamily: "Sora",
    //     fontSize: "24px",
    //     fontWeight: "600",
    //     fontColor: "#000",
    //   },
    //   align: "left",
    // },
    title: { text: "" },
    legend: {
      enabled: false, // Set this to false to disable the legend
    },
    credits: {
      enabled: false, // Set this to false to disable the credits
    },
    xAxis: {
      type: "datetime",
      lineColor: "#F0F0F0",
      tickColor: "#F0F0F0",
      labels: {
        style: {
          color: "#33323A",
          fontSize: "14px",
          fontWeight: "600",
        },
      },
    },
    yAxis: {
      opposite: true,
      title: {
        text: "",
      },
      labels: {
        style: {
          color: "#77838F",
          fontSize: "14px",
          fontWeight: "400",
        },
        formatter: function () {
          let value = Number(this.value);
          if (value >= 1e9) {
            return "$" + value / 1e9 + "B";
          } else if (value >= 1e6) {
            return "$" + value / 1e6 + "M";
          } else if (value >= 1e3) {
            return "$" + value / 1e3 + "K";
          } else {
            return "$" + value;
          }
        },
      },
    },

    tooltip: {
      backgroundColor: "black",
      borderWidth: 0,
      borderRadius: 0,
      shadow: false,
      style: {
        fontFamily: "Sora",
        fontSize: "12px",
        fontWeight: "400",
        lineHeight: "12px",
        letterSpacing: "-0.02em",
        textAlign: "right",
        color: "white",
      },
      shape: "callout", // Use the callout shape (custom SVG path)
      positioner: function (width, height, point) {
        const chart = this.chart;
        const tooltipX = point.plotX + chart.plotLeft - width - 10; // Adjust tooltipX to move it leftward
        const tooltipY = point.plotY + chart.plotTop - 50; // Adjust tooltipY to move it upward
        return { x: tooltipX, y: tooltipY };
      },
      formatter: function () {
        let yValue: string | number = Number(this.y);
        if (yValue >= 1e9) {
          yValue = "$" + yValue / 1e9 + "B";
        } else if (yValue >= 1e6) {
          yValue = "$" + yValue / 1e6 + "M";
        } else if (yValue >= 1e3) {
          yValue = "$" + yValue / 1e3 + "K";
        } else {
          yValue = "$" + yValue;
        }
        const xValue = Highcharts.dateFormat("%e %b %Y", Number(this.x));
        // Format the tooltip with x and y values
        return `<span style=" font-size: 12px; ">${yValue}</span><br/><span>${xValue}</span>`;
      },
    },
    chart: {
      zooming: {
        type: "x",
        mouseWheel: true,
      },
    },
    series: [
      {
        type: "area",
        color: {
          linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
          stops: [
            [0, "#ffffff"],
            [1, "#3354F4"],
          ],
        },
        lineColor: "#3354F4",
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
        const txs =
          wallet?.transactions.map(
            (tx) =>
              ({
                ...tx,
                address: wallet.address,
                comments: wallet.comments,
                likes: wallet.likes,
                dislikes: wallet.dislikes,
              } as ExtendedTransaction)
          ) || [];

        setTransactions(txs);

        const balance = await getBalance(user.address);
        setBalance(balance || {});

        const tokens = [
          ...(balance?.binance?.tokens.map((token) => ({
            ...token,
            network: "binance",
          })) || []),
          ...(balance?.ethereum?.tokens.map((token) => ({
            ...token,
            network: "ethereum",
          })) || []),
          ...(balance?.polygon?.tokens.map((token) => ({
            ...token,
            network: "polygon",
          })) || []),
        ].filter((token) => Number(token.balance) !== 0);

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
                  selectedToken.symbol.toLowerCase()
              );
              return [Number(history.date), Number(foundToken?.usd)];
            });
          }
        }
        return {
          ...defaultOption,
          series: [
            {
              type: "area",
              color: {
                linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
                stops: [
                  [0, "#ffffff"],
                  [1, "#3354F4"],
                ],
              },
              lineColor: "#3354F4",
              data: data,
            },
          ],
        };
      } else {
        return defaultOption;
      }
    });
  }, [balanceHistory, selectedToken]);

  const fetchMoreTransactions = useCallback(async () => {
    try {
      const wallet = await findWalletTransactions(
        user.address,
        transactions.length + 4
      );

      const txs =
        wallet?.transactions.map(
          (tx) =>
            ({
              ...tx,
              address: wallet.address,
              comments: wallet.comments,
              likes: wallet.likes,
              dislikes: wallet.dislikes,
            } as ExtendedTransaction)
        ) || [];

      if (transactions.length === txs.length) setFetchMore(false);
      setTimeout(() => setTransactions(txs), 1500);
    } catch (error) {
      console.log(error);
    }
  }, [user.address, transactions]);

  if (!transactions) return <div className='text-center'>Loading...</div>;

  const EtherValues =
    balance.ethereum?.tokens.reduce(
      (sum, token) => sum + Number(token.usd),
      0
    ) || 0;

  const PolygonValues =
    balance.polygon?.tokens.reduce(
      (sum, token) => sum + Number(token.usd),
      0
    ) || 0;

  const BinanceValues =
    balance.binance?.tokens.reduce(
      (sum, token) => sum + Number(token.usd),
      0
    ) || 0;

  const BinanceSparkLineData =
    balanceHistory.binance?.map(
      (balance) =>
        balance.tokens.reduce((sum, token) => sum + Number(token.usd), 0) || 0
    ) || [];

  const EthereumSparkLineData =
    balanceHistory.ethereum?.map(
      (balance) =>
        balance.tokens.reduce((sum, token) => sum + Number(token.usd), 0) || 0
    ) || [];

  const PolygonSparkLineData =
    balanceHistory.polygon?.map(
      (balance) =>
        balance.tokens.reduce((sum, token) => sum + Number(token.usd), 0) || 0
    ) || [];

  const AllSparkLineData = EthereumSparkLineData.map(
    (val, i) => val + PolygonSparkLineData[i] + BinanceSparkLineData[i]
  );

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
        <div className='flex lg:flex-row flex-col justify-center gap-4 mt-2'>
          <div className='lg:grow lg:mx-0 mx-4 w-full'>
            <span className='font-sora font-normal text-[32px]'>Portfolio</span>
            <div className='mb-4 p-5'>
              <div className='flex justify-between bg-white p-4'>
                <span className='font-sora font-semibold text-2xl'>
                  Balance History
                </span>
                <select
                  className='border rounded px-2 py-1 text-center'
                  defaultValue={tokensOfWallet[0]?.symbol}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const foundToken = tokensOfWallet.find(
                      (token) => token.symbol.toLowerCase() === e.target.value
                    );
                    setSelectedToken(foundToken);
                  }}
                >
                  {tokensOfWallet.map((token) => (
                    <option value={token.symbol.toLowerCase()}>
                      <span className='font-inter text-lg'>
                        {token.symbol.toUpperCase()}
                      </span>
                    </option>
                  ))}
                </select>
              </div>
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartComponentRef}
              />
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
                <Asset
                  blockchain='All'
                  balance={balanceFormatter(
                    EtherValues + BinanceValues + PolygonValues
                  )}
                  history={AllSparkLineData}
                />
                <Asset
                  blockchain='BNB Chain'
                  balance={balanceFormatter(BinanceValues)}
                  history={BinanceSparkLineData}
                />
                <Asset
                  blockchain='ETH'
                  balance={balanceFormatter(EtherValues)}
                  history={EthereumSparkLineData}
                />
                <Asset
                  blockchain='Polygon'
                  balance={balanceFormatter(PolygonValues)}
                  history={PolygonSparkLineData}
                />
              </div>
              <TableContainer component={Paper} className='mt-4'>
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
                    {tokensOfWallet.map((token, id) => (
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
                                token.symbol === "ETH" ||
                                token.symbol === "MATIC"
                                  ? `./images/tokens/${token.symbol.toLowerCase()}.png`
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
                        <TableCell>
                          ${Number(token.usd).toLocaleString()}
                        </TableCell>
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

            <InfiniteScroll
              dataLength={transactions.length}
              next={fetchMoreTransactions}
              hasMore={fetchMore}
              loader={<h4 className='text-center'>Loading...</h4>}
              endMessage={
                <div className='text-center'>No transactions to load more</div>
              }
            >
              {transactions.map((transaction) => (
                <TransactionDetailsCard
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
