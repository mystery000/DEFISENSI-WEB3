import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BscscanController } from './bscscan.controller';
import { BscscanService } from './bscscan.service';

@Module({
  imports: [HttpModule],
  controllers: [BscscanController],
  providers: [BscscanService],
  exports: [BscscanService],
})
export class BscscanModule {}
