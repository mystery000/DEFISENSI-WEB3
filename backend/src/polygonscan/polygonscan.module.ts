import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PolygonscanService } from './polygonscan.service';
import { PolygonscanController } from './polygonscan.controller';

@Module({
  imports: [HttpModule],
  controllers: [PolygonscanController],
  providers: [PolygonscanService],
  exports: [PolygonscanService],
})
export class PolygonscanModule {}
