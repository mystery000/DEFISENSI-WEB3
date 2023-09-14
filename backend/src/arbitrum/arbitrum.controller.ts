import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { ArbitrumService } from './arbitrum.service';

@ApiTags('Arbitrum')
@Controller('arbitrum')
export class ArbitrumController {
  constructor(private readonly arbitrumService: ArbitrumService) {}

  @Get('/test')
  test() {
    return this.arbitrumService.test();
  }
}
