import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import { JSDOM } from 'jsdom';
import * as moment from 'moment';
import { ZenRows } from 'zenrows';
import { DEX_ABI } from './abi/dex';
import { v4 as uuidv4 } from 'uuid';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import {
  Action,
  BalancesResponse,
  ExchangesPriceResponse,
  NFTTransaction,
  PortfolioResponse,
  Token,
  TokenPricesResponse,
  TokenTransaction,
  TopERC20Token,
  TopNFT,
  TopWallet,
} from 'src/utils/types';
import { CovalenthqChain } from 'src/utils/chains';
import { CovalentClient } from '@covalenthq/client-sdk';
import { ServiceConfig } from 'src/config/service.config';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';

@Injectable()
export class BscscanService {
  private readonly web3: Web3;
  private readonly serviceConfig: ServiceConfig;

  constructor(private readonly configService: ConfigService) {
    // BSCSCAN Public RPC Nodes: https://docs.bscscan.com/misc-tools-and-utilities/public-rpc-nodes#json-rpc-methods
    const provider = `https://bsc-dataseed1.binance.org/`;
    this.web3 = new Web3(provider);
    this.serviceConfig = this.configService.get<ServiceConfig>('service');
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
              id: uuidv4(),
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
              likes: [],
              dislikes: [],
              comments: [],
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
              })
              .then((response) => {
                const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                const value = log.decoded_event.params.find((param) => param.name === 'value').value;
                transactions.push({
                  id: uuidv4(),
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
                  likes: [],
                  dislikes: [],
                  comments: [],
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
                id: uuidv4(),
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
                likes: [],
                dislikes: [],
                comments: [],
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
              })
              .then((response) => {
                const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                const value = log.decoded_event.params.find((param) => param.name === 'value').value;
                transactions.push({
                  id: uuidv4(),
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
                  likes: [],
                  dislikes: [],
                  comments: [],
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
                id: uuidv4(),
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
                likes: [],
                dislikes: [],
                comments: [],
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
              id: uuidv4(),
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
              likes: [],
              dislikes: [],
              comments: [],
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
              id: uuidv4(),
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
              likes: [],
              dislikes: [],
              comments: [],
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

  async getPriceFromExchanges(address: string) {
    let exchangesPrice: ExchangesPriceResponse = {};

    try {
      const uniswap = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.BSC,
        address,
        exchange: 'pancakeswapv3',
      });

      if (!uniswap) return exchangesPrice;

      const { usdPrice, tokenSymbol } = uniswap.toJSON();

      exchangesPrice.uniswap = usdPrice;

      const [binanceResponse, kucoinResponse] = await Promise.all([
        axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${tokenSymbol}USDT`),
        axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${tokenSymbol}-USDT`),
      ]);

      if (binanceResponse && binanceResponse.data) {
        exchangesPrice.binance = Number(binanceResponse.data.price);
      }

      if (kucoinResponse && kucoinResponse.data) {
        exchangesPrice.kucoin = Number(kucoinResponse.data.data?.price);
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return exchangesPrice;
    }
  }

  async getTopERC20Tokens() {
    let topTokens: TopERC20Token[] = [];
    const url = 'https://bscscan.com/tokens';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, {});
      const dom = new JSDOM(data);
      const tokenList = dom.window.document.querySelectorAll('#ContentPlaceHolder1_tblErc20Tokens tbody tr');
      topTokens = Array.from(tokenList).map((token) => {
        return {
          name: token.querySelector('td:nth-child(2) .hash-tag.text-truncate.fw-medium').innerHTML,
          address: token.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(7),
          price: token.querySelector('td:nth-child(3) .d-inline').getAttribute('data-bs-title'),
          change: (<HTMLElement>token.querySelector('td:nth-child(4)')).innerText,
        };
      });
    } catch (error) {
      logger.error(error);
    } finally {
      return topTokens;
    }
  }

  async getTopNFTs() {
    let topNFTs: TopNFT[] = [];
    const url = 'https://bscscan.com/nft-top-contracts';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait: 30000, wait_for: '#datatable' });
      const dom = new JSDOM(data);
      const nfts = dom.window.document.querySelectorAll('#datatable tbody tr');
      topNFTs = Array.from(nfts).map((nft) => {
        return {
          address: nft.querySelector('td:nth-child(2) a').getAttribute('href').slice(7),
          name: nft.querySelector('td:nth-child(2) a div:nth-child(2)').innerHTML,
          volume: nft.querySelector('td:nth-child(4)').innerHTML,
          change: (<HTMLElement>nft.querySelector('td:nth-child(5)')).innerText,
          floor: nft.querySelector('td:nth-child(6)').innerHTML,
          holders: nft.querySelector('td:nth-child(10)').innerHTML,
        };
      });
    } catch (err) {
      logger.error(err);
    } finally {
      return topNFTs;
    }
  }

  async getTopWallets() {
    let accounts: TopWallet[] = [];
    const url = 'https://bscscan.com/accounts';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, {});
      const dom = new JSDOM(data);
      const accountList = dom.window.document.querySelectorAll('#ContentPlaceHolder1_divTable tbody tr');
      accounts = Array.from(accountList).map((account) => {
        return {
          address: account.querySelector('td a.js-clipboard.link-secondary').getAttribute('data-clipboard-text'),
          balance: account
            .querySelector('td:nth-child(4)')
            .innerHTML.replace(/<[^>]+>/g, '')
            .trim(),
          percentage: account.querySelector('td:nth-child(5)').innerHTML,
        };
      });
    } catch (error) {
      logger.error(error);
    } finally {
      return accounts;
    }
  }

  async getTokenPrices(address: string, from: string, to: string): Promise<TokenPricesResponse> {
    if (!moment(from, 'YYYY-MM-DD', true).isValid() || !moment(to, 'YYYY-MM-DD', true).isValid()) {
      throw new BadRequestException('Please use YYYY-MM-DD date format');
    }
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.PricingService.getTokenPrices(CovalenthqChain.BSC, 'USD', address, { to, from });
      return resp.data?.[0];
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getTokenBalancesForWalletAddress(address: string): Promise<BalancesResponse> {
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(CovalenthqChain.BSC, address, {
        nft: true,
        quoteCurrency: 'USD',
      });
      return resp.data.items.map((item) => ({
        logo_url: item.logo_url,
        contract_decimals: item.contract_decimals,
        contract_name: item.contract_name,
        contract_address: item.contract_address,
        contract_ticker_symbol: item.contract_ticker_symbol,
        balance: item.balance?.toString() || '0',
        quote: item.quote?.toString() || '0',
        pretty_quote: item.pretty_quote || '0',
        type: item.type,
      }));
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getHistoricalPortfolioForWalletAddress(address: string, days: number): Promise<PortfolioResponse> {
    try {
      const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
        chains: [EvmChain.BSC],
        address,
      });
      const active_chain = response.toJSON().active_chains.find((chain) => chain.chain === 'bsc');
      if (!active_chain.first_transaction) return [];
      const offset = moment().diff(moment(active_chain.first_transaction.block_timestamp), 'days');
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getHistoricalPortfolioForWalletAddress(CovalenthqChain.BSC, address, {
        days: Math.min(days, offset),
        quoteCurrency: 'USD',
      });

      const transformedData = resp.data.items.reduce((acc, curr) => {
        const singleTokenTimeSeries = curr.holdings.map((holdingsItem) => {
          return {
            timestamp: holdingsItem.timestamp,
            [curr.contract_ticker_symbol]: holdingsItem.close.quote || 0,
          };
        });
        const newArr = singleTokenTimeSeries.map((item, i) => Object.assign(item, acc[i]));
        return newArr;
      }, []);
      return transformedData.map((data) => {
        let total = 0;
        for (const [key, value] of Object.entries(data)) {
          if (key === 'timestamp') continue;
          total += Number(value);
        }
        return {
          timestamp: data.timestamp,
          total_quote: total.toString(),
          pretty_total_quote: `$${total.toLocaleString()}`,
        };
      });
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async test() {}
}
