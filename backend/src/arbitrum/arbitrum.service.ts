import { EvmChain } from '@moralisweb3/common-evm-utils';
import { Injectable } from '@nestjs/common';

import axios from 'axios';
import Moralis from 'moralis';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import { logger } from 'src/utils/logger';
import { ChainbaseChain, HistoricalPrice, NFTTransaction, TokenTransaction } from 'src/utils/types';

@Injectable()
export class ArbitrumService {
  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    const transactions: TokenTransaction[] = [];
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
    const transactions: NFTTransaction[] = [];
    return transactions;
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

  async test() {
    return this.getTransactionsByContract('0xda10009cbd5d07dd0cecc66161fc93d7c9000da1');
  }
}
