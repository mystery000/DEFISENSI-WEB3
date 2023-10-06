import { Module } from '@nestjs/common';
import { AvalancheService } from './avalanche.service';
import { AvalancheController } from './avalanche.controller';

@Module({
  providers: [AvalancheService],
  controllers: [AvalancheController],
  exports: [AvalancheService],
})
export class AvalancheModule {}
