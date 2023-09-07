import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NftService } from './nft.service';
import { UserModule } from '../user/user.module';
import { NftController } from './nft.controller';
import { Nft, NftSchema } from './schemas/nft.schema';
import { CommentModule } from '../comment/comment.module';
import { EtherscanModule } from 'src/etherscan/etherscan.module';
import { PolygonscanModule } from 'src/polygonscan/polygonscan.module';

@Module({
  imports: [
    UserModule,
    CommentModule,
    EtherscanModule,
    PolygonscanModule,
    MongooseModule.forFeature([{ name: Nft.name, schema: NftSchema }]),
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule {}
