import { EvmChain } from '@moralisweb3/common-evm-utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import Moralis from 'moralis';
import * as moment from 'moment';
import { logger } from 'src/utils/logger';
import { Action, HistoricalPrice, NFTTransaction, TokenBalance, TokenTransaction } from 'src/utils/types';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import axios from 'axios';
import { NetworkType } from 'src/utils/enums/network.enum';

@Injectable()
export class PolygonscanService {
  private readonly MATIC_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
  constructor(private readonly http: HttpService) {}

  async getTransactionsByWallet(address: string, fromBlock: number = 0) {
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

  async getTransactionsByERC20(address: string, fromBlock: number = 0) {
    /* set network to NetworkType.Polygon */
    const transactions: TokenTransaction[] = [];
    return transactions;
  }
  async getTransactionsByNFTCollection(address: string, fromBlock: number = 0) {
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
            if (log.decoded_event.label === 'OrderFulfilled') {
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
              if (log.decoded_event.label === 'Transfer') {
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

  async getBalances(address: string) {
    let tokens: TokenBalance[] = [];

    // Get the latest block number
    const now = moment();
    const response = await Moralis.EvmApi.block.getDateToBlock({
      chain: EvmChain.POLYGON,
      date: now.toString(),
    });

    const latestBlockNumber = response.toJSON().block;
    const timestamp = response.toJSON().block_timestamp;

    // Get native balance by wallet
    const nativeToken = await Moralis.EvmApi.balance.getNativeBalance({
      chain: EvmChain.POLYGON,
      address,
      toBlock: latestBlockNumber,
    });

    const nativePrice = await Moralis.EvmApi.token.getTokenPrice({
      chain: EvmChain.POLYGON,
      address: this.MATIC_ADDRESS,
      toBlock: latestBlockNumber,
    });

    tokens.push({
      logo: null,
      name: 'MATIC',
      symbol: 'MATIC',
      contractAddress: this.MATIC_ADDRESS,
      decimals: 18,
      value: nativeToken.toJSON().balance,
      usdPrice: ((nativePrice.toJSON().usdPrice * Number(nativeToken.toJSON().balance)) / 1e18).toFixed(2),
    });

    // Get ERC20 token balance by wallet
    const erc20Tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: EvmChain.POLYGON,
      address,
      toBlock: latestBlockNumber,
    });

    for (const token of erc20Tokens.toJSON()) {
      let price = 0;
      if (!token.possible_spam) {
        try {
          const response = await Moralis.EvmApi.token.getTokenPrice({
            chain: EvmChain.POLYGON,
            address: token.token_address,
            toBlock: latestBlockNumber,
          });
          price = response.toJSON().usdPrice;
        } catch (error) {
          // logger.error(error);
        }
      }
      tokens.push({
        logo: token.logo,
        name: token.name,
        symbol: token.symbol,
        contractAddress: token.token_address,
        decimals: token.decimals,
        value: token.balance,
        usdPrice: ((price * Number(token.balance)) / 10 ** token.decimals).toFixed(2),
      });
    }

    return { timestamp, tokens };
  }

  async getPriceHistory(contractAddress: string) {
    // const CHAINBASE_BASE_URL = 'https://api.chainbase.online';
    const CHAINBASE_BASE_URL = 'http://95.217.141.220:3000';
    const CHAINBASE_API_KEY = process.env.CHAINBASE_API_KEY;

    let toTimestamp = Math.round(new Date().getTime() / 1000);
    let fromTimestamp = toTimestamp - 86400 * 90;

    try {
      const response = await axios.get(
        `${CHAINBASE_BASE_URL}/v1/token/price/history?chain_id=137&contract_address=${contractAddress}&from_timestamp=${fromTimestamp}&end_timestamp=${toTimestamp}`,
        {
          headers: { accept: 'application/json', 'x-api-key': CHAINBASE_API_KEY },
        },
      );
      return response.data.data as HistoricalPrice[];
    } catch (error) {
      logger.error(error);
      return [] as HistoricalPrice[];
    }
  }

  async test() {
    /*
      Examples of wallet address
      address: '0x71956a1Cd5a4233177F7Bf9a2d5778851e201934',
    */
    // return this.getTransactionsByWallet('0x71956a1Cd5a4233177F7Bf9a2d5778851e201934');

    // return this.getBalances('0x71956a1Cd5a4233177F7Bf9a2d5778851e201934');
    return this.getTransactionsByNFTCollection('0x4d544035500D7aC1B42329c70eb58E77f8249f0F');
  }
}
