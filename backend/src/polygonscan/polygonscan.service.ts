import { EvmChain } from '@moralisweb3/common-evm-utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import Moralis from 'moralis';
import { logger } from 'src/utils/logger';
import { Transaction } from 'src/utils/types';

@Injectable()
export class PolygonscanService {
  constructor(private readonly http: HttpService) {}

  async getTransactionsByWallet(address: string, fromBlock: number = 0) {
    const transactions: Transaction[] = [];
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
          txhash: txn.hash,
          blockNumber: txn.block_number,
          details: {
            from: txn.from_address,
            to: txn.to_address,
            timestamp: new Date(txn.block_timestamp).getTime(),
            token0: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: '18',
              logo: matic_price.tokenLogo,
              contractAddress: matic_price.tokenAddress,
              value: txn.value,
              usdPrice: ((matic_price.usdPrice * Number(txn.value)) / 1e18).toString(),
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
          txhash: txn.transaction_hash,
          blockNumber: txn.block_number,
          details: {
            from: txn.from_address,
            to: txn.to_address,
            timestamp: new Date(txn.block_timestamp).getTime(),
            token0: {
              name: txn.token_name,
              symbol: txn.token_symbol,
              decimals: txn.token_decimals,
              logo: txn.token_logo,
              contractAddress: txn.address,
              value: txn.value,
              usdPrice: (tokenPrice.usdPrice * Number(txn.value_decimal)).toString(),
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

  async getTransactionsByERC20(contractAddress: string, fromBlock: number = 0) {}

  async getTransactionsByERC721(contractAddress: string, fromBlock: number = 0) {}

  async getTransactionsByERC1155(contractAddress: string, fromBlock: number = 0) {}

  async test() {
    /*
      Examples of wallet address
      address: '0x71956a1Cd5a4233177F7Bf9a2d5778851e201934',
    */
    return this.getTransactionsByWallet('0x71956a1Cd5a4233177F7Bf9a2d5778851e201934');
  }
}
