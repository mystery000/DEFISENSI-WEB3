import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { Transaction } from 'src/utils/types';

@Injectable()
export class PolygonscanService {
  constructor(private readonly http: HttpService) {}

  // // async getTransactionsByWallet(address: string, startBlock: number = 0) {
  // //   const latestBlockNumber = await this.alchemy.core.getBlockNumber();
  // //   try {
  // //     const res = this.http.get(
  // //       `${this.polygonscanApiBaseUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${latestBlockNumber}&sort=asc&apikey=${this.config.polygonscanApiKey}`,
  // //     );
  // //     const txs = ((await firstValueFrom(res)).data.result || []) as any[];

  // //     const transactions = txs.map((tx) => ({
  // //       txhash: tx.hash,
  // //       blockNumber: tx.blockNumber,
  // //       details: null,
  // //     })) as Transaction[];

  // //     return transactions;
  // //   } catch (error) {
  // //     console.log(error);
  // //   }
  // // }

  // // async getTransactionsByToken(contractAddress: string, startBlock: number = 0) {
  // //   // Get latest 1000 transfers of ERC20
  // //   const allTransfers = await this.alchemy.core.getAssetTransfers({
  // //     fromBlock: `0x${startBlock.toString(16)}`,
  // //     toBlock: 'latest',
  // //     contractAddresses: [contractAddress], // You can replace with contract of your choosing
  // //     excludeZeroValue: true,
  // //     category: [AssetTransfersCategory.ERC20],
  // //     maxCount: 1000,
  // //     order: SortingOrder.DESCENDING,
  // //   });

  // //   let currerntHash = '';
  // //   const transactions: Transaction[] = [];

  // //   allTransfers.transfers.forEach((transfer) => {
  // //     if (transfer.hash !== currerntHash) {
  // //       currerntHash = transfer.hash;
  // //       transactions.push({
  // //         txhash: transfer.hash,
  // //         blockNumber: parseInt(transfer.blockNum, 16).toString(),
  // //         details: null,
  // //       } as Transaction);
  // //     }
  // //   });

  // //   console.log(transactions);
  // // }

  // // async getTransactionsByNFT(contractAddress: string, startBlock: number = 0) {
  // //   // Get latest 1000 transfers of ERC721 and ERC1155
  // //   const allTransfers = await this.alchemy.core.getAssetTransfers({
  // //     fromBlock: `0x${startBlock.toString(16)}`,
  // //     toBlock: 'latest',
  // //     contractAddresses: [contractAddress], // You can replace with contract of your choosing
  // //     excludeZeroValue: true,
  // //     category: [AssetTransfersCategory.ERC721],
  // //     maxCount: 1000,
  // //     order: SortingOrder.DESCENDING,
  // //   });

  // //   let currerntHash = '';
  // //   const transactions: Transaction[] = [];

  // //   allTransfers.transfers.forEach((transfer) => {
  // //     if (transfer.hash !== currerntHash) {
  // //       currerntHash = transfer.hash;
  // //       transactions.push({
  // //         txhash: transfer.hash,
  // //         blockNumber: parseInt(transfer.blockNum, 16).toString(),
  // //         details: null,
  // //       } as Transaction);
  // //     }
  // //   });

  // //   console.log(transactions);
  // // }

  // // async getTransactionDetails(txHash: string) {}

  // async test() {
  //   this.getTransactionsByNFT('0x141A1fb33683C304DA7C3fe6fC6a49B5C0c2dC42');
  // }
}
