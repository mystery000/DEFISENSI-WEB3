import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletService } from './wallet.service';
import { UserModule } from '../user/user.module';
import { WalletController } from './wallet.controller';
import { CommentModule } from '../comment/comment.module';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { EtherscanModule } from 'src/etherscan/etherscan.module';

@Module({
  imports: [
    UserModule,
    CommentModule,
    EtherscanModule,
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
