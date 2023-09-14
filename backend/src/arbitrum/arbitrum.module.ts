import { Module } from '@nestjs/common';
import { ArbitrumService } from './arbitrum.service';
import { ArbitrumController } from './arbitrum.controller';

@Module({
  providers: [ArbitrumService],
  controllers: [ArbitrumController],
  exports: [ArbitrumService],
})
export class ArbitrumModule {}
