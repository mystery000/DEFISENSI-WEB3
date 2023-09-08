import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { BscscanService } from './bscscan.service';

@ApiTags('BscScan')
@Controller('bscscan')
export class BscscanController {
  constructor(private readonly bscscanService: BscscanService) {}

  @Get('/test')
  async test() {
    return this.bscscanService.test();
  }
}
