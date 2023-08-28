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
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { NotificationModule } from './notification/notification.module';
import { EtherscanModule } from './etherscan/etherscan.module';
import { PolygonscanModule } from './polygonscan/polygonscan.module';
import { CronJobModule } from './cron-job/cron-job.module';
import { MailingModule } from './mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
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
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    UserModule,
    WalletModule,
    TokenModule,
    NftModule,
    NotificationModule,
    EtherscanModule,
    PolygonscanModule,
    CronJobModule,
    MailingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
