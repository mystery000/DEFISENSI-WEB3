import { Controller, Get } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { AvalancheService } from './avalanche.service';

@ApiTags('Avalanche')
@Controller('avalanche')
export class AvalancheController {
  constructor(private readonly avalanche: AvalancheService) {}

  @Get('/test')
  test() {
    return this.avalanche.test();
  }
}
