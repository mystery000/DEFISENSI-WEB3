import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';

import Moralis from 'moralis';
import { JSDOM } from 'jsdom';
import * as moment from 'moment';
import { ZenRows } from 'zenrows';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { ServiceConfig } from 'src/config/service.config';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import {
  Action,
  BalancesResponse,
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

type Transaction = TokenTransaction | NFTTransaction;

@Injectable()
export class ArbitrumService {
  private readonly serviceConfig: ServiceConfig;

  constructor(private readonly configService: ConfigService) {
    this.serviceConfig = this.configService.get<ServiceConfig>('service');
  }

  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    const transactions: Transaction[] = [];

    const [TokenTxns, NFTTxns] = await Promise.all([
      Moralis.EvmApi.token.getWalletTokenTransfers({
        chain: EvmChain.ARBITRUM,
        address,
        limit: 2,
      }),
      Moralis.EvmApi.nft.getWalletNFTTransfers({
        chain: EvmChain.ARBITRUM,
        address,
        format: 'decimal',
        limit: 2,
      }),
    ]);

    for (const transfer of TokenTxns.toJSON().result) {
      const {
        transaction_hash,
        block_number,
        block_timestamp,
        token_decimals,
        token_name,
        token_symbol,
        token_logo,
        address,
        value,
      } = transfer;

      let price = 0;
      try {
        const resp = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ARBITRUM,
          address,
        });
        price = resp.toJSON().usdPrice;
      } catch (error) {
        logger.error(error);
      }

      transactions.push({
        txHash: transaction_hash,
        blockNumber: block_number,
        type: TransactionType.TOKEN,
        network: NetworkType.ARBITRUM,
        timestamp: new Date(block_timestamp).getTime(),
        details: {
          from: transfer.from_address,
          to: transfer.to_address,
          token0: {
            name: token_name,
            symbol: token_symbol,
            logo: token_logo,
            contractAddress: address,
            decimals: token_decimals,
            amount: value,
            price: price.toString(),
          },
        },
      });
    }

    for (const transfer of NFTTxns.toJSON().result) {
      const { token_address, from_address, to_address, transaction_hash, block_timestamp, block_number, amount } =
        transfer;
      Moralis.EvmApi.nft
        .getNFTContractMetadata({
          chain: EvmChain.ARBITRUM,
          address: token_address,
        })
        .then((response) => {
          const { name, symbol } = response.toJSON();
          const action: Action = {
            type: Number(from_address) === 0 ? 'Mint' : Number(to_address) ? 'Burn' : 'Transfer',
            amount: Number(amount),
            tokenAddress: token_address,
            name,
            symbol,
          };
          transactions.push({
            txHash: transaction_hash,
            blockNumber: block_number,
            type: TransactionType.NFT,
            network: NetworkType.ARBITRUM,
            timestamp: new Date(block_timestamp).getTime(),
            details: {
              from: from_address,
              to: to_address,
              actions: [action],
            },
          });
        });
    }

    return transactions;
  }

  async getTransactionsByContract(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];
    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];
      await Moralis.EvmApi.token
        .getTokenTransfers({
          chain: EvmChain.ARBITRUM,
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
          chain: EvmChain.ARBITRUM,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp } = transaction.toJSON();
        for (const log of logs) {
          if (address.toLocaleLowerCase() !== log.address) continue;
          await Moralis.EvmApi.token
            .getTokenPrice({
              chain: EvmChain.ARBITRUM,
              address: log.address,
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
                network: NetworkType.ARBITRUM,
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
          chain: EvmChain.ARBITRUM,
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
      console.log(txHashs);
      // Get decoded transaction by hash
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.ARBITRUM,
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
                      chain: EvmChain.ARBITRUM,
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
              network: NetworkType.ARBITRUM,
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
                  chain: EvmChain.ARBITRUM,
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
              network: NetworkType.ARBITRUM,
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

  async getTopERC20Tokens() {
    let topTokens: TopERC20Token[] = [];
    const url = 'https://arbiscan.io/tokens';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait_for: '#tblResult' });
      const dom = new JSDOM(data);
      const accountList = dom.window.document.querySelectorAll('#tblResult tbody tr');
      topTokens = Array.from(accountList).map((account) => {
        return {
          name: account.querySelector('td:nth-child(2) a.text-primary').textContent.trim(),
          address: account.querySelector('td:nth-child(2) a.text-primary').getAttribute('href').slice(7),
          price: account.querySelector('td:nth-child(3) span').textContent.trim(),
          change: account.querySelector('td:nth-child(4) span').textContent.trim(),
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
    const url = 'https://arbitrum.nftscan.com/ranking';
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
    const url = 'https://arbiscan.io/accounts';
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
      const resp = await client.PricingService.getTokenPrices(CovalenthqChain.Arbitrum, 'USD', address, { to, from });
      return resp.data?.[0];
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getTokenBalancesForWalletAddress(address: string): Promise<BalancesResponse> {
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(CovalenthqChain.Arbitrum, address, {
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
        chains: [EvmChain.ARBITRUM],
        address,
      });
      const active_chain = response.toJSON().active_chains.find((chain) => chain.chain === 'arbitrum');
      if (!active_chain.first_transaction) return [];
      const offset = moment().diff(moment(active_chain.first_transaction.block_timestamp), 'days');
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getHistoricalPortfolioForWalletAddress(
        CovalenthqChain.Arbitrum,
        address,
        {
          days: Math.min(days, offset),
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
