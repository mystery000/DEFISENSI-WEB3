import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import configs from './config/index';
import { AppService } from './app.service';
import { NftModule } from './nft/nft.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { TokenModule } from './token/token.module';
import { WalletModule } from './wallet/wallet.module';
import { CronJobModule } from './cron-job/cron-job.module';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { EtherscanModule } from './etherscan/etherscan.module';
import { PolygonscanModule } from './polygonscan/polygonscan.module';
import { NotificationModule } from './notification/notification.module';
import { BscscanService } from './bscscan/bscscan.service';
import { BscscanController } from './bscscan/bscscan.controller';
import { BscscanModule } from './bscscan/bscscan.module';
import { ArbitrumController } from './arbitrum/arbitrum.controller';
import { ArbitrumModule } from './arbitrum/arbitrum.module';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [DatabaseService],
      imports: [DatabaseModule],
      useFactory: (databaseService: DatabaseService) => databaseService.createMongooseOptions(),
    }),
    UserModule,
    WalletModule,
    TokenModule,
    NftModule,
    NotificationModule,
    EtherscanModule,
    PolygonscanModule,
    CronJobModule,
    BscscanModule,
    ArbitrumModule,
    MailModule,
  ],
  controllers: [AppController, BscscanController, ArbitrumController],
  providers: [AppService, BscscanService],
})
export class AppModule {}
