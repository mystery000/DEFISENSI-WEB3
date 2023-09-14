import { Injectable } from '@nestjs/common';
import { NFTTransaction, TokenTransaction } from 'src/utils/types';

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

  async test() {}
}
