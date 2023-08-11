import { EvmChain } from '@moralisweb3/common-evm-utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import Moralis from 'moralis';
import * as moment from 'moment';
import { logger } from 'src/utils/logger';
import { TokenBalance, Transaction } from 'src/utils/types';
import { TransactionType } from 'src/utils/enums/transaction.enum';

@Injectable()
export class PolygonscanService {
  private readonly MATIC_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
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
          type: TransactionType.TOKEN,
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
          type: TransactionType.TOKEN,
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

  async test() {
    /*
      Examples of wallet address
      address: '0x71956a1Cd5a4233177F7Bf9a2d5778851e201934',
    */
    // return this.getTransactionsByWallet('0x71956a1Cd5a4233177F7Bf9a2d5778851e201934');

    return this.getBalances('0x71956a1Cd5a4233177F7Bf9a2d5778851e201934');
  }
}
