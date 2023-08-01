import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from './cron-job.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { EtherscanModule } from 'src/etherscan/etherscan.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [ScheduleModule.forRoot(), WalletModule, EtherscanModule, TokenModule],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
