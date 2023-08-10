import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { EtherscanService } from './etherscan.service';

@ApiTags('Etherscan')
@Controller('etherscan')
export class EtherscanController {
  constructor(private readonly etherscanService: EtherscanService) {}

  @Get('/webhook/transaction')
  async getTransactionByWebhook() {}

  @Get('/test')
  async test() {
    return this.etherscanService.test();
  }
}
