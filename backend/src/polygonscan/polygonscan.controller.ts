import { Controller, Get, Param } from '@nestjs/common';
import { PolygonscanService } from './polygonscan.service';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Polygonscan')
@Controller('polygonscan')
export class PolygonscanController {
  constructor(private readonly polygonscanService: PolygonscanService) {}

  @Get('/test')
  async test() {
    return this.polygonscanService.test();
  }
}
