import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { EtherscanService } from './etherscan.service';

@ApiTags('Etherscan')
@Controller('etherscan')
export class EtherscanController {
  constructor(private readonly etherscanService: EtherscanService) {}

  @Get('/test')
  async test() {
    return this.etherscanService.test();
  }
}
