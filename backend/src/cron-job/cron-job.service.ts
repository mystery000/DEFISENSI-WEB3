import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { logger } from 'src/utils/logger';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';
import { EtherscanService } from 'src/etherscan/etherscan.service';

@Injectable()
export class CronJobService {
  constructor(private readonly walletService: WalletService, private readonly tokenService: TokenService) {}

  // Update the transactions of all wallets every 3 minutes
  // @Cron('0 */3 * * * *')
  async handleWalletCron() {
    try {
      const wallets = await this.walletService.getAll();
      for (const wallet of wallets) {
        await this.walletService.updateTransactions(wallet.address);
        logger.log(`The wallet of ${wallet.address} has been successfully updated`);
      }
    } catch (error) {
      logger.log('Wallet CronJob Error: ', error);
    }
  }

  // Update the transactions of all ERC20 tokens every 3 minutes
  // @Cron('0 */3 * * * *')
  async handleERC20Cron() {
    try {
      const tokens = await this.tokenService.getAll();
      for (const token of tokens) {
        await this.tokenService.updateTransactions(token.address, token.network);
        logger.log(`The ERC20 token of ${token.address} has been successfully updated`);
      }
    } catch (error) {
      logger.log('ERC20 CronJob Error: ', error);
    }
  }
}
