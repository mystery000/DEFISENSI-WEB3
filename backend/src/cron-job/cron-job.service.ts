import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { logger } from 'src/utils/logger';
import { NftService } from 'src/nft/nft.service';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class CronJobService {
  constructor(
    private readonly walletService: WalletService,
    private readonly tokenService: TokenService,
    private readonly nftService: NftService,
  ) {}

  // Update the transactions of all wallets every 3 minutes
  // @Cron('0 */3 * * * *')
  async handleWalletCronForTxns() {
    try {
      const wallets = await this.walletService.getAll();
      for (const wallet of wallets) {
        await this.walletService.updateTransactions(wallet.address);
        logger.log(`The wallet of ${wallet.address} has been successfully updated`);
      }
    } catch (error) {
      logger.log('Error in the wallet cronjob for updating transactions: ', error);
    }
  }

  // Update the transactions of all ERC20 tokens every 3 minutes
  // @Cron('0 */3 * * * *')
  async handleERC20CronForTxns() {
    try {
      const tokens = await this.tokenService.getAll();
      for (const token of tokens) {
        await this.tokenService.updateTransactions(token.address, token.network);
        logger.log(`The ERC20 token of ${token.address} has been successfully updated`);
      }
    } catch (error) {
      logger.log('Error in the ERC20 cronjob for updating transactions: ', error);
    }
  }

  // Update the balances of all wallets every 2 minutes
  // @Cron('0 */2 * * * *')
  async handleWalletCronForBalance() {
    try {
      const wallets = await this.walletService.getAll();
      for (const wallet of wallets) {
        await this.walletService.updateBalance(wallet.address);
        logger.log(`The wallet of ${wallet.address} has been successfully updated`);
      }
    } catch (error) {
      logger.error('Error in the wallet cronjob for updating balances: ', error);
    }
  }

  // Update the transactions of all NFT tokens every 3 minutes
  // @Cron('0 */3 * * * *')
  async handleNFTCronForTxns() {
    try {
      const nfts = await this.nftService.getAll();
      for (const nft of nfts) {
        await this.nftService.updateTransactions(nft.address, nft.network);
        logger.log(`The NFT token of ${nft.address} has been successfully updated`);
      }
    } catch (error) {
      logger.log('Error in the NFT cronjob for updating transactions: ', error);
    }
  }
}
