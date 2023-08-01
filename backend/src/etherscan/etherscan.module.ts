import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';

import { TokenModule } from 'src/token/token.module';
import { EtherscanService } from './etherscan.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { EtherscanController } from './etherscan.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
@Module({
  imports: [HttpModule, forwardRef(() => WalletModule), forwardRef(() => TokenModule)],
  controllers: [EtherscanController],
  providers: [EtherscanService],
  exports: [EtherscanService],
})
export class EtherscanModule {}
