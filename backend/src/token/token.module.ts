import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenService } from './token.service';
import { UserModule } from '../user/user.module';
import { TokenController } from './token.controller';
import { CommentModule } from '../comment/comment.module';
import { Token, TokenSchema } from './schemas/token.schema';
import { EtherscanModule } from 'src/etherscan/etherscan.module';
import { PolygonscanModule } from 'src/polygonscan/polygonscan.module';
import { BscscanModule } from 'src/bscscan/bscscan.module';
import { ArbitrumModule } from 'src/arbitrum/arbitrum.module';
import { AvalancheModule } from 'src/avalanche/avalanche.module';

@Module({
  imports: [
    UserModule,
    CommentModule,
    EtherscanModule,
    PolygonscanModule,
    BscscanModule,
    ArbitrumModule,
    AvalancheModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
