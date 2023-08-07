import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { logger } from 'src/utils/logger';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';
import { EtherscanService } from 'src/etherscan/etherscan.service';

@Injectable()
export class CronJobService {
  constructor(
    private readonly walletService: WalletService,
    private readonly etherscanService: EtherscanService,
    private readonly tokenService: TokenService,
  ) {}

  // @Cron('0 */3 * * * *')
  async handleWalletCron() {
    logger.log(`(${new Date()})[cron-job]: Fetch wallet transactions`);
    const wallets = await this.walletService.getAll();
    try {
      wallets.forEach(async (wallet) => {
        if (wallet.transactions.length > 0) {
          const lastBlockNumber = wallet.transactions.at(-1).blockNumber || 0;
          await this.etherscanService.updateWalletTransactions(wallet.address, Number(lastBlockNumber) + 1);
        } else {
          await this.etherscanService.initializeWalletTransactions(wallet.address);
        }
        logger.log(`Wallet: ${wallet.address}`);
      });
    } catch (error) {
      logger.log(error);
    }
  }

  // @Cron('0 */3 * * * *')
  async handleWallet20Cron() {
    logger.log(`(${new Date()})[wallet-cron-job]: Get transaction details`);
    const wallets = await this.walletService.getAll();
    const MAX_TRANSACTIONS = 5; // Max count to process every round.

    let transactions: {
      address: string;
      transaction: { txhash: String };
    }[] = [];

    // Extract up to 3 transactions from every wallet and then get transaction details
    wallets.forEach((wallet) => {
      let count = 0;
      const walletTransactions =
        wallet.transactions.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)) || [];

      walletTransactions.forEach((transaction) => {
        if (count === MAX_TRANSACTIONS) return;
        if (!transaction.details) {
          const { txhash } = transaction;
          transactions.push({ address: wallet.address, transaction: { txhash } });
          count += 1;
        }
      });
    });

    try {
      // Get the transaction details
      transactions.forEach(async (tx) => {
        await this.walletService.setTransactionDetail(tx.transaction.txhash as string, tx.address);
        logger.log('[Wallet Transaction]Txhash: ', tx.transaction.txhash);
      });
    } catch (error) {
      logger.error(error);
    }
  }

  // @Cron('0 */3 * * * *')
  async handleTokenCron() {
    logger.log(`(${new Date()})[cron-job]: Fetch token contract transactions`);
    const tokens = await this.tokenService.getAll();
    try {
      tokens.forEach(async (token) => {
        if (token.transactions.length > 0) {
          const lastBlockNumber = token.transactions.at(-1).blockNumber || 0;
          await this.etherscanService.updateTokenTransactions(token.address, token.network, Number(lastBlockNumber));
        } else {
          await this.etherscanService.initializeTokenTransactions(token.address, token.network);
        }
        logger.log(`Token Contract: ${token.address}`);
      });
    } catch (error) {
      logger.log(error);
    }
  }

  // @Cron('0 */3 * * * *')
  async handleToken20Cron() {
    logger.log(`(${new Date()})[token-cron-job]: Get transaction details`);
    const tokens = await this.tokenService.getAll();
    const MAX_TRANSACTIONS = 5; // Max count to process every round.

    let transactions: {
      address: string;
      network: string;
      transaction: { txhash: String };
    }[] = [];

    // Extract up to 3 transactions from every wallet and then get transaction details
    tokens.forEach((token) => {
      let count = 0;
      const tokenTransactions = token.transactions.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)) || [];

      tokenTransactions.forEach((transaction) => {
        if (count === MAX_TRANSACTIONS) return;
        if (!transaction.details) {
          const { txhash } = transaction;
          transactions.push({ address: token.address, network: token.network, transaction: { txhash } });
          count += 1;
        }
      });
    });
    try {
      // Get the transaction details
      transactions.forEach(async (tx) => {
        await this.tokenService.setTransactionDetail(tx.transaction.txhash as string, tx.address, tx.network);
        logger.log('[Token Transaction]-Txhash: ', tx.transaction.txhash);
      });
    } catch (error) {
      logger.log(error);
    }
  }

  @Cron('0 */5 * * * *')
  async handleWalletBalance() {
    logger.log(`(${new Date()})[cron-job]: Get tokens balance`);
    const wallets = await this.walletService.getAll();
    wallets.forEach(async (wallet) => {
      logger.log(`Obtaining the balances of ${wallet.address} address`);
      try {
        await this.walletService.getTokenBalances(wallet.address);
      } catch (error) {
        logger.log(`Failed to get balances due to ${error}`);
      }
    });
  }
}
