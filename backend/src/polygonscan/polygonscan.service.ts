import { ConfigService } from '@nestjs/config';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import { JSDOM } from 'jsdom';
import * as moment from 'moment';
import { ZenRows } from 'zenrows';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import {
  Action,
  BalancesResponse,
  ExchangePrice,
  NFTTransaction,
  PortfolioResponse,
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
export class PolygonscanService {
  private readonly web3: Web3;
  private readonly serviceConfig: ServiceConfig;
  private readonly MATIC_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';

  constructor(private readonly configService: ConfigService) {
    const provider = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.web3 = new Web3(provider);
    this.serviceConfig = this.configService.get<ServiceConfig>('service');
  }

  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    const transactions: TokenTransaction[] = [];
    try {
      // Get native transactions by wallet
      const nativeTxns = await Moralis.EvmApi.transaction.getWalletTransactions({
        chain: EvmChain.POLYGON,
        address,
        limit: 3,
        fromBlock,
      });

      for (const txn of nativeTxns.toJSON().result) {
        if (txn.value === '0') continue;

        const matic_price = (
          await Moralis.EvmApi.token.getTokenPrice({
            chain: EvmChain.POLYGON,
            address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // Wrapped MATIC address
            toBlock: Number(txn.block_number),
          })
        ).toJSON();

        transactions.push({
          txHash: txn.hash,
          blockNumber: txn.block_number,
          type: TransactionType.TOKEN,
          timestamp: new Date(txn.block_timestamp).getTime(),
          network: NetworkType.POLYGON,
          details: {
            from: txn.from_address,
            to: txn.to_address,
            token0: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: '18',
              logo: matic_price.tokenLogo,
              contractAddress: matic_price.tokenAddress,
              amount: txn.value,
              price: ((matic_price.usdPrice * Number(txn.value)) / 1e18).toString(),
            },
          },
        });
      }

      // Get ERC20 token transfers by wallet
      const erc20Txns = await Moralis.EvmApi.token.getWalletTokenTransfers({
        chain: EvmChain.POLYGON,
        address,
        limit: 2,
        fromBlock,
      });
      for (const txn of erc20Txns.toJSON().result) {
        let tokenPrice = null;
        try {
          tokenPrice = (
            await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.POLYGON,
              address: txn.address,
              toBlock: Number(txn.block_number),
            })
          ).toJSON();
        } catch (error) {
          tokenPrice = { usdPrice: 0 };
        }

        transactions.push({
          txHash: txn.transaction_hash,
          blockNumber: txn.block_number,
          type: TransactionType.TOKEN,
          timestamp: new Date(txn.block_timestamp).getTime(),
          network: NetworkType.POLYGON,
          details: {
            from: txn.from_address,
            to: txn.to_address,
            token0: {
              name: txn.token_name,
              symbol: txn.token_symbol,
              decimals: txn.token_decimals,
              logo: txn.token_logo,
              contractAddress: txn.address,
              amount: txn.value,
              price: (tokenPrice.usdPrice * Number(txn.value_decimal)).toString(),
            },
          },
        });
      }
    } catch (error) {
      logger.error(error);
      return transactions.sort((a, b) => b.blockNumber.localeCompare(a.blockNumber));
    }
    return transactions.sort((a, b) => b.blockNumber.localeCompare(a.blockNumber));
  }

  async getTransactionsByContract(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];
    try {
      // Get Token transfers by contract and extract transaction hashs
      let transfers = [];
      await Moralis.EvmApi.token
        .getTokenTransfers({
          chain: EvmChain.POLYGON,
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }

      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.POLYGON,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp } = transaction.toJSON();
        for (const log of logs) {
          if (address.toLocaleLowerCase() !== log.address) continue;
          await Moralis.EvmApi.token
            .getTokenPrice({
              chain: EvmChain.POLYGON,
              address: log.address,
              exchange: 'uniswapv3',
            })
            .then((response) => {
              const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
              const from = log.decoded_event?.params.find((param) => param.name === 'from').value;
              const to = log.decoded_event?.params.find((param) => param.name === 'to').value;
              const value = log.decoded_event?.params.find((param) => param.name === 'value').value;

              transactions.push({
                txHash,
                blockNumber: block_number,
                type: TransactionType.TOKEN,
                network: NetworkType.POLYGON,
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
        }
      }
    } catch (error) {
      console.log(error);
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
          chain: EvmChain.POLYGON,
          format: 'decimal',
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }

      // Get decoded transaction by hash
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.POLYGON,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp, from_address, to_address } = transaction.toJSON();
        // Check if there is OrderFulFilled event in logs
        const order = logs.find((log) => log.decoded_event?.label === 'OrderFulfilled');
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
                      chain: EvmChain.POLYGON,
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

          if (actions.length > 0) {
            transactions.push({
              txHash,
              blockNumber: block_number,
              type: TransactionType.NFT,
              network: NetworkType.POLYGON,
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
                  chain: EvmChain.POLYGON,
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

          if (actions.length > 0)
            transactions.push({
              txHash,
              blockNumber: block_number,
              type: TransactionType.NFT,
              network: NetworkType.POLYGON,
              timestamp: new Date(block_timestamp).getTime(),
              details: {
                from: from_address,
                to: to_address,
                actions,
              },
            });
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
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
        chain: EvmChain.POLYGON,
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

  async getTopERC20Tokens() {
    let topTokens: TopERC20Token[] = [];
    const url = 'https://polygonscan.com/tokens';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, {});
      const dom = new JSDOM(data);
      const accountList = dom.window.document.querySelectorAll('#tblResult tbody tr');
      topTokens = Array.from(accountList).map((account) => {
        return {
          name: account.querySelector('td:nth-child(2) a:first-child').innerHTML,
          address: account.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(7),
          price: account.querySelector('td:nth-child(3) span:first-child').innerHTML,
          change: (<HTMLElement>account.querySelector('td:nth-child(4) span')).innerText,
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
    const url = 'https://polygon.nftscan.com/ranking';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait: 30000, wait_for: '.tr____CfO6' });
      const dom = new JSDOM(data);
      const nfts = dom.window.document.querySelectorAll('table tbody tr.tr____CfO6');
      topNFTs = Array.from(nfts).map((nft) => {
        const holdersHTML = nft.querySelector('td:nth-child(2) div.f-small').innerHTML;
        return {
          address: nft.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(1),
          name: nft.querySelector('td:nth-child(2) a:first-child').innerHTML,
          volume: nft.querySelector('td:nth-child(4) span').innerHTML + ' MATIC',
          floor: nft.querySelector('td:nth-child(6)').textContent.trim() + ' MATIC',
          change: nft.querySelector('td:nth-child(7)').textContent.trim(),
          holders: holdersHTML.slice(0, holdersHTML.indexOf('Owners') - 1),
        };
      });
    } catch (error) {
      logger.error(error);
    } finally {
      return topNFTs;
    }
  }

  async getTopWallets() {
    let accounts: TopWallet[] = [];
    const url = 'https://polygonscan.com/accounts';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, {});
      const dom = new JSDOM(data);
      const accountList = dom.window.document.querySelectorAll('#ContentPlaceHolder1_divTable tbody tr');
      accounts = Array.from(accountList).map((account) => {
        return {
          address: account.querySelector('td a').innerHTML,
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
      const resp = await client.PricingService.getTokenPrices(CovalenthqChain.Polygon, 'USD', address, { to, from });
      return resp.data?.[0];
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getTokenBalancesForWalletAddress(address: string): Promise<BalancesResponse> {
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(CovalenthqChain.Polygon, address, {
        nft: false,
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
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getHistoricalPortfolioForWalletAddress(
        CovalenthqChain.Polygon,
        address,
        {
          days: days,
          quoteCurrency: 'USD',
        },
      );

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
