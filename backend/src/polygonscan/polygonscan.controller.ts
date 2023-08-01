import { Controller } from '@nestjs/common';
import { PolygonscanService } from './polygonscan.service';

@Controller('polygonscan')
export class PolygonscanController {
  constructor(private readonly polygonscanService: PolygonscanService) {}
}
