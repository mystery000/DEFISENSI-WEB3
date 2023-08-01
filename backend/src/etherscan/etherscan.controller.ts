import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { EtherscanService } from './etherscan.service';

@ApiTags('Etherscan')
@Controller('etherscan')
export class EtherscanController {
  constructor(private readonly etherscanService: EtherscanService) {}

  @Get('/test')
  @ApiOperation({ summary: ' Get token transactions for this user' })
  async getFollowingTokensTransactions() {
    return this.etherscanService.test();
  }
}
