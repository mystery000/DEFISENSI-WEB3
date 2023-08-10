import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { EtherscanService } from './etherscan.service';
import { EtherscanController } from './etherscan.controller';
@Module({
  imports: [HttpModule],
  controllers: [EtherscanController],
  providers: [EtherscanService],
  exports: [EtherscanService],
})
export class EtherscanModule {}
