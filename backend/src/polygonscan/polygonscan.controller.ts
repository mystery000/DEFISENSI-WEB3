import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { PolygonscanService } from './polygonscan.service';

@ApiTags('Polygonscan')
@Controller('polygonscan')
export class PolygonscanController {
  constructor(private readonly polygonscanService: PolygonscanService) {}

  @Get('/test')
  async test() {
    return this.polygonscanService.test();
  }
}
