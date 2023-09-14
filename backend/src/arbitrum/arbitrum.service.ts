import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { logger } from 'src/utils/logger';
import { ChainbaseChain, HistoricalPrice, NFTTransaction, TokenTransaction } from 'src/utils/types';

@Injectable()
export class ArbitrumService {
  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    const transactions: TokenTransaction[] = [];
    return transactions;
  }
  async getTransactionsByContract(address: string, fromBlock: number = 0) {
    const transactions: TokenTransaction[] = [];
    return transactions;
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

  async test() {}
}
