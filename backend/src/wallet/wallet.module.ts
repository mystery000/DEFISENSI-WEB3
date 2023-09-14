import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletService } from './wallet.service';
import { UserModule } from '../user/user.module';
import { WalletController } from './wallet.controller';
import { CommentModule } from '../comment/comment.module';
import { BscscanModule } from 'src/bscscan/bscscan.module';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { EtherscanModule } from 'src/etherscan/etherscan.module';
import { PolygonscanModule } from 'src/polygonscan/polygonscan.module';
import { ArbitrumModule } from 'src/arbitrum/arbitrum.module';

@Module({
  imports: [
    UserModule,
    CommentModule,
    EtherscanModule,
    PolygonscanModule,
    BscscanModule,
    ArbitrumModule,
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
