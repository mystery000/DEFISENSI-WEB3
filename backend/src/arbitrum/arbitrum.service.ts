import { Injectable } from '@nestjs/common';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import puppeteer from 'puppeteer';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import {
  Action,
  ChainbaseChain,
  HistoricalPrice,
  NFTTransaction,
  TokenTransaction,
  TopERC20Token,
  TopWallet,
} from 'src/utils/types';

type Transaction = TokenTransaction | NFTTransaction;

@Injectable()
export class ArbitrumService {
  private readonly web3: Web3;

  constructor() {
    const provider = `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.web3 = new Web3(provider);
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

      const response = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.ARBITRUM,
        address,
        exchange: 'uniswapv3',
      });

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
            price: response?.toJSON().usdPrice.toString() || '0',
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

  // Get the price history of ERC20 token for 90 days
  async getPriceHistory(address: string) {
    // const CHAINBASE_BASE_URL = 'https://api.chainbase.online';
    const CHAINBASE_BASE_URL = 'http://95.217.141.220:3000';
    const CHAINBASE_API_KEY = process.env.CHAINBASE_API_KEY;
    let toTimestamp = Math.round(new Date().getTime() / 1000);
    let fromTimestamp = toTimestamp - 86400 * 90;

    try {
      const response = await axios.get(
        `${CHAINBASE_BASE_URL}/v1/token/price/history?chain_id=${ChainbaseChain.ARBITRUM}&contract_address=${address}&from_timestamp=${fromTimestamp}&end_timestamp=${toTimestamp}`,
        {
          headers: { accept: 'application/json', 'x-api-key': CHAINBASE_API_KEY },
        },
      );
      return response.data.data as HistoricalPrice[];
    } catch (error) {
      logger.error(error);
    }
  }

  async getTopERC20Tokens() {
    let topTokens: TopERC20Token[] = [];

    try {
      const broswer = await puppeteer.launch({ headless: false, defaultViewport: null });
      const page = await broswer.newPage();
      await page.goto('https://arbiscan.io/tokens', {
        waitUntil: 'domcontentloaded',
      });

      topTokens = await page.evaluate(() => {
        const accountList = document.querySelectorAll('#tblResult tbody tr');
        return Array.from(accountList).map((account) => {
          return {
            name: account.querySelector('td:nth-child(2) a:first-child').innerHTML,
            address: account.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(7),
            price: account.querySelector('td:nth-child(3) span:first-child').innerHTML,
            change: (<HTMLElement>account.querySelector('td:nth-child(4) span')).innerText,
          };
        });
      });

      await broswer.close();
      return topTokens;
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
      await page.goto('https://arbiscan.io/accounts', {
        waitUntil: 'domcontentloaded',
      });

      accounts = await page.evaluate(() => {
        const accountList = document.querySelectorAll('#ContentPlaceHolder1_divTable tbody tr');
        return Array.from(accountList).map((account) => {
          return {
            address: account.querySelector('td a').innerHTML,
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
