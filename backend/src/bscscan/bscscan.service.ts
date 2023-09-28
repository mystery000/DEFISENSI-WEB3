import { Injectable } from '@nestjs/common';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import { DEX_ABI } from './abi/dex';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import {
  Action,
  ChainbaseChain,
  ExchangePrice,
  HistoricalPrice,
  NFTTransaction,
  Token,
  TokenTransaction,
  TopWallet,
} from 'src/utils/types';
import puppeteer from 'puppeteer';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';

@Injectable()
export class BscscanService {
  private readonly web3: Web3;

  constructor() {
    // BSCSCAN Public RPC Nodes: https://docs.bscscan.com/misc-tools-and-utilities/public-rpc-nodes#json-rpc-methods
    const provider = `https://bsc-dataseed1.binance.org/`;
    this.web3 = new Web3(provider);
  }
  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];
    const WRAPPED_BNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];

      const bnbPrice = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.BSC,
        address: WRAPPED_BNB_ADDRESS,
        exchange: 'uniswapv3',
      });

      // Native token (BNB) transfer
      await Moralis.EvmApi.transaction
        .getWalletTransactions({
          chain: EvmChain.BSC,
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          const transfers = response.toJSON().result;
          for (const transfer of transfers) {
            transactions.push({
              txHash: transfer.hash,
              blockNumber: transfer.block_number,
              type: TransactionType.TOKEN,
              network: NetworkType.BSC,
              timestamp: new Date(transfer.block_timestamp).getTime(),
              details: {
                from: transfer.from_address,
                to: transfer.to_address,
                token0: {
                  name: 'Binance Chain Native Token',
                  symbol: 'BNB',
                  contractAddress: WRAPPED_BNB_ADDRESS,
                  decimals: '18',
                  amount: transfer.value,
                  price: bnbPrice?.toJSON().usdPrice.toString() || '0',
                },
              },
            });
          }
        });

      // BEP-20 token transfers
      await Moralis.EvmApi.token
        .getWalletTokenTransfers({
          chain: EvmChain.BSC,
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!transfer.possible_spam && !txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.BSC,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp } = transaction.toJSON();
        // check if there is swap event in the logs
        const isSwapTransaction = logs.find((log) => log.decoded_event?.label === 'Swap');
        for (const log of logs) {
          if (log.decoded_event?.label === 'Transfer') {
            if (isSwapTransaction) continue;

            // Get only first Transfer Event, ignore others
            await Moralis.EvmApi.token
              .getTokenPrice({
                chain: EvmChain.BSC,
                address: log.address,
                exchange: 'uniswapv3',
              })
              .then((response) => {
                const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                const value = log.decoded_event.params.find((param) => param.name === 'value').value;
                transactions.push({
                  txHash,
                  blockNumber: block_number,
                  type: TransactionType.TOKEN,
                  network: NetworkType.BSC,
                  timestamp: new Date(block_timestamp).getTime(),
                  details: {
                    from,
                    to,
                    token0: {
                      name: tokenName,
                      symbol: tokenSymbol,
                      logo: tokenLogo,
                      contractAddress: log.address,
                      decimals: tokenDecimals,
                      amount: value,
                      price: usdPrice.toString(),
                    },
                  },
                });
              });

            break;
          } else if (log.decoded_event?.label === 'Swap') {
            if (log.decoded_event.signature === 'Swap(address,uint256,uint256,uint256,uint256,address)') {
              // V2 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v2, log.address);
              const [tokenAddress0, tokenAddress1]: [any, any] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              if (!tokenAddress0 || !tokenAddress1) continue;
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const amount0In = log.decoded_event.params.find((param) => param.name === 'amount0In').value;
              const amount1In = log.decoded_event.params.find((param) => param.name === 'amount1In').value;
              const amount0Out = log.decoded_event.params.find((param) => param.name === 'amount0Out').value;
              const amount1Out = log.decoded_event.params.find((param) => param.name === 'amount1Out').value;
              const to = log.decoded_event.params.find((param) => param.name === 'to').value;

              let [token0, token1]: [Token, Token] = [undefined, undefined];

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0In) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token0 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0In) > 0 ? amount0In : amount1In,
                    price: usdPrice.toString(),
                  };
                });

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0Out) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token1 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0Out) > 0 ? amount0Out : amount1Out,
                    price: usdPrice.toString(),
                  };
                });

              if (!token0 || !token0) continue;

              transactions.push({
                txHash,
                blockNumber: block_number,
                type: TransactionType.TOKEN,
                network: NetworkType.BSC,
                timestamp: new Date(block_timestamp).getTime(),
                details: {
                  from: sender,
                  to,
                  token0,
                  token1,
                },
              });
            } else if (log.decoded_event.signature === 'Swap(address,address,int256,int256,uint160,uint128,int24)') {
              // V3 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v3, log.address);
              const [token0, token1] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const recipient = log.decoded_event.params.find((param) => param.name === 'recipient').value;
              const amount0 = log.decoded_event.params.find((param) => param.name === 'amount0').value;
              const amount1 = log.decoded_event.params.find((param) => param.name === 'amount1').value;
            }
          }
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  async getTransactionsByContract(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];

    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];
      await Moralis.EvmApi.token
        .getTokenTransfers({
          chain: EvmChain.BSC,
          address: address,
          limit: 4,
          fromBlock,
          //   toBlock: 31568295,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!transfer.possible_spam && !txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }

      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.BSC,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp } = transaction.toJSON();
        // check if there is swap event in the logs
        const isSwapTransaction = logs.find((log) => log.decoded_event?.label === 'Swap');
        for (const log of logs) {
          if (log.decoded_event?.label === 'Transfer') {
            if (isSwapTransaction) continue;
            if (address.toLocaleLowerCase() !== log.address) continue;
            // Get only first Transfer Event, ignore others
            await Moralis.EvmApi.token
              .getTokenPrice({
                chain: EvmChain.BSC,
                address: log.address,
                exchange: 'uniswapv3',
              })
              .then((response) => {
                const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                const value = log.decoded_event.params.find((param) => param.name === 'value').value;
                transactions.push({
                  txHash,
                  blockNumber: block_number,
                  type: TransactionType.TOKEN,
                  network: NetworkType.BSC,
                  timestamp: new Date(block_timestamp).getTime(),
                  details: {
                    from,
                    to,
                    token0: {
                      name: tokenName,
                      symbol: tokenSymbol,
                      logo: tokenLogo,
                      contractAddress: log.address,
                      decimals: tokenDecimals,
                      amount: value,
                      price: usdPrice.toString(),
                    },
                  },
                });
              });

            break;
          } else if (log.decoded_event?.label === 'Swap') {
            if (log.decoded_event.signature === 'Swap(address,uint256,uint256,uint256,uint256,address)') {
              // V2 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v2, log.address);
              const [tokenAddress0, tokenAddress1]: [any, any] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              if (!tokenAddress0 || !tokenAddress1) continue;
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const amount0In = log.decoded_event.params.find((param) => param.name === 'amount0In').value;
              const amount1In = log.decoded_event.params.find((param) => param.name === 'amount1In').value;
              const amount0Out = log.decoded_event.params.find((param) => param.name === 'amount0Out').value;
              const amount1Out = log.decoded_event.params.find((param) => param.name === 'amount1Out').value;
              const to = log.decoded_event.params.find((param) => param.name === 'to').value;

              let [token0, token1]: [Token, Token] = [undefined, undefined];

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0In) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token0 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0In) > 0 ? amount0In : amount1In,
                    price: usdPrice.toString(),
                  };
                });

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0Out) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token1 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0Out) > 0 ? amount0Out : amount1Out,
                    price: usdPrice.toString(),
                  };
                });

              if (!token0 || !token0) continue;

              transactions.push({
                txHash,
                blockNumber: block_number,
                type: TransactionType.TOKEN,
                network: NetworkType.BSC,
                timestamp: new Date(block_timestamp).getTime(),
                details: {
                  from: sender,
                  to,
                  token0,
                  token1,
                },
              });
            } else if (log.decoded_event.signature === 'Swap(address,address,int256,int256,uint160,uint128,int24)') {
              // V3 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v3, log.address);
              const [token0, token1] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const recipient = log.decoded_event.params.find((param) => param.name === 'recipient').value;
              const amount0 = log.decoded_event.params.find((param) => param.name === 'amount0').value;
              const amount1 = log.decoded_event.params.find((param) => param.name === 'amount1').value;
            }
          }
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  async getTransactionsByNFT(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: NFTTransaction[] = [];
    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];

      await Moralis.EvmApi.nft
        .getNFTContractTransfers({
          chain: EvmChain.BSC,
          format: 'decimal',
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!transfer.possible_spam && !txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }
      // Get decoded transaction by hash
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.BSC,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp, from_address, to_address } = transaction.toJSON();
        // Check if there is OrderFulFilled event in logs
        const order = logs.find((log) => log?.decoded_event?.label === 'OrderFulfilled');
        if (order) {
          let metadata: any = {};

          /* Metadata Type:
              sales?: number,
              purchases?: number,
              name: string, 
              symbol: string 
              contractType: 'ERC721' | 'ERC1155'
          */

          for (const log of logs) {
            if (log.decoded_event?.label === 'OrderFulfilled') {
              // Check if order type is purchase or sale
              const offer = log.decoded_event.params.find((param) => param.name === 'offer')?.value || '';
              const decodedValue = offer.split(',');
              const spentItems: { itemType: number; address: string; identifier: string; amount: number }[] = [];
              for (let i = 0; i < decodedValue.length; i += 4) {
                if (decodedValue[i] === undefined) return;
                spentItems.push({
                  itemType: Number(decodedValue[i]),
                  address: decodedValue[i + 1],
                  identifier: decodedValue[i + 2],
                  amount: Number(decodedValue[i + 3]),
                });
              }
              for (const item of spentItems) {
                /*
                 itemType 0: Native Token
                          1: ERC20
                          2: ERC721
                */
                if (item.itemType == 2 && metadata[item.address]) {
                  metadata[item.address] = {
                    ...metadata[item.address],
                    sales: metadata[item.address].sales + item.amount,
                  };
                }

                if (item.itemType === 2 && !metadata[item.address]) {
                  await Moralis.EvmApi.nft
                    .getNFTContractMetadata({
                      chain: EvmChain.BSC,
                      address: item.address,
                    })
                    .then((response) => {
                      metadata[item.address] = { ...response.toJSON(), sales: item.amount };
                    })
                    .catch((error) => {});
                }
              }
            }
          }

          let actions: Action[] = [];
          Object.entries(metadata).map(([key, value]: [key: string, value: any]) => {
            if (value.sales) {
              actions.push({
                type: 'Sale',
                amount: value.sales,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
            if (value.purchases) {
              actions.push({
                type: 'Purchase',
                amount: value.purchases,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
          });

          if (actions.length) {
            transactions.push({
              txHash,
              blockNumber: block_number,
              type: TransactionType.NFT,
              network: NetworkType.BSC,
              timestamp: new Date(block_timestamp).getTime(),
              details: {
                from: from_address,
                to: to_address,
                actions,
              },
            });
          }
        } else {
          let metadata: any = {};
          /* Metadata Type:

              mints?: number
              transfers?: number
              burns?: number
              name: string,
              symbol: string
              contractType: 'ERC721' | 'ERC1155'
          */

          // Tranfer
          for (const log of logs) {
            if (!metadata[log.address]) {
              await Moralis.EvmApi.nft
                .getNFTContractMetadata({
                  chain: EvmChain.BSC,
                  address: log.address,
                })
                .then((response) => {
                  metadata[log.address] = { ...response.toJSON() };
                })
                .catch((error) => {});
            }
            // Parse ERC721 and ERC1155
            if (metadata[log.address]) {
              if (log.decoded_event?.label === 'Transfer') {
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                if (Number(from) === 0) {
                  // Mint Tranfer
                  metadata[log.address] = { ...metadata[log.address], mints: (metadata[log.address].mints || 0) + 1 };
                } else if (Number(to) === 0) {
                  // Burn Transfer
                  metadata[log.address] = { ...metadata[log.address], burns: (metadata[log.address].burns || 0) + 1 };
                } else {
                  metadata[log.address] = {
                    ...metadata[log.address],
                    transfers: (metadata[log.address].transfers || 0) + 1,
                  };
                }
              }
            }
          }

          let actions: Action[] = [];
          Object.entries(metadata).map(([key, value]: [key: string, value: any]) => {
            if (value.mints) {
              actions.push({
                type: 'Mint',
                amount: value.mints,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
            if (value.burns) {
              actions.push({
                type: 'Burn',
                amount: value.burns,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
            if (value.transfers) {
              actions.push({
                type: 'Transfer',
                amount: value.transfers,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
          });

          if (actions.length > 0) {
            transactions.push({
              txHash,
              blockNumber: block_number,
              type: TransactionType.NFT,
              network: NetworkType.BSC,
              timestamp: new Date(block_timestamp).getTime(),
              details: {
                from: from_address,
                to: to_address,
                actions,
              },
            });
          }
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  // Get the price history of ERC20 token for 90 days
  async getPriceHistory(address: string) {
    // const CHAINBASE_BASE_URL = 'https://api.chainbase.online';
    const CHAINBASE_BASE_URL = 'http://95.217.141.220:3000';
    const CHAINBASE_API_KEY = process.env.CHAINBASE_API_KEY;
    let toTimestamp = Math.round(new Date().getTime() / 1000);
    let fromTimestamp = toTimestamp - 86400 * 90;

    try {
      const response = await axios.get(
        `${CHAINBASE_BASE_URL}/v1/token/price/history?chain_id=${ChainbaseChain.BSC}&contract_address=${address}&from_timestamp=${fromTimestamp}&end_timestamp=${toTimestamp}`,
        {
          headers: { accept: 'application/json', 'x-api-key': CHAINBASE_API_KEY },
        },
      );
      return response.data.data as HistoricalPrice[];
    } catch (error) {
      logger.error(error);
    }
  }

  async getPriceFromExchanges(address: string) {
    let exchangesPrice: ExchangePrice = {
      tokenName: '',
      tokenAddress: '',
      tokenSymbol: '',
      tokenLogo: '',
      tokenDecimals: '',
      usdPrice: {},
    };

    try {
      // Uniswap V3
      const uniswap = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.BSC,
        address,
      });

      if (!uniswap) return exchangesPrice;

      const { tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } = uniswap.toJSON();

      exchangesPrice.tokenDecimals = tokenDecimals;
      exchangesPrice.tokenLogo = tokenLogo;
      exchangesPrice.tokenName = tokenName;
      exchangesPrice.tokenSymbol = tokenSymbol;
      exchangesPrice.usdPrice = { ...exchangesPrice.usdPrice, uniswap: usdPrice.toString() };
      // Get prices from Binance and Kucoin in parallel
      const [binanceResponse, kucoinResponse] = await Promise.all([
        axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${tokenSymbol}USDT`).catch((error) => {}),
        axios
          .get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${tokenSymbol}-USDT`)
          .catch((error) => {}),
      ]);

      if (binanceResponse && binanceResponse.data) {
        exchangesPrice.usdPrice = { ...exchangesPrice.usdPrice, binance: binanceResponse.data.price };
      }

      if (kucoinResponse && kucoinResponse.data) {
        exchangesPrice.usdPrice = { ...exchangesPrice.usdPrice, kucoin: kucoinResponse.data.data?.price };
      }

      return exchangesPrice;
    } catch (error) {
      logger.error(error);
      return exchangesPrice;
    }
  }

  async getTopERC20Tokens(order?: string) {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-smart-chain&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`,
      );
      const tokens = response.data;

      switch (order) {
        case 'current_price_asc':
          return tokens.sort((a, b) => a.current_price - b.current_price);
        case 'current_price_desc':
          return tokens.sort((a, b) => b.current_price - a.current_price);
        case 'price_change_percentage_24h_asc':
          return tokens.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        case 'price_change_percentage_24h_desc':
          return tokens.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      }

      return tokens;
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  async getTopNFTs() {}

  async getTopWallets() {
    let accounts: TopWallet[] = [];
    try {
      const broswer = await puppeteer.launch({ headless: false, defaultViewport: null });
      const page = await broswer.newPage();
      await page.goto('https://bscscan.com/accounts', {
        waitUntil: 'domcontentloaded',
      });

      accounts = await page.evaluate(() => {
        const accountList = document.querySelectorAll('#ContentPlaceHolder1_divTable tbody tr');
        return Array.from(accountList).map((account) => {
          return {
            address: account.querySelector('td a.js-clipboard.link-secondary').getAttribute('data-clipboard-text'),
            balance: account
              .querySelector('td:nth-child(4)')
              .innerHTML.replace(/<[^>]+>/g, '')
              .trim(),
            percentage: account.querySelector('td:nth-child(5)').innerHTML,
          };
        });
      });
      await broswer.close();
    } catch (error) {
      logger.error(error);
    } finally {
      return accounts || [];
    }
  }

  async test() {}
}
