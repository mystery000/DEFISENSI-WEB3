import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenService } from './token.service';
import { UserModule } from '../user/user.module';
import { TokenController } from './token.controller';
import { CommentModule } from '../comment/comment.module';
import { Token, TokenSchema } from './schemas/token.schema';
import { EtherscanModule } from 'src/etherscan/etherscan.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    UserModule,
    CommentModule,
    EtherscanModule,
    WalletModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
