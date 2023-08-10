import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from './cron-job.service';
import { TokenModule } from 'src/token/token.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [ScheduleModule.forRoot(), WalletModule, TokenModule],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
