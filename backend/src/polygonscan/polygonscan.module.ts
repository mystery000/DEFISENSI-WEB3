import { Module, forwardRef } from '@nestjs/common';
import { PolygonscanService } from './polygonscan.service';
import { PolygonscanController } from './polygonscan.controller';
import { HttpModule } from '@nestjs/axios';
import { WalletModule } from 'src/wallet/wallet.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [HttpModule, forwardRef(() => WalletModule), forwardRef(() => TokenModule)],
  controllers: [PolygonscanController],
  providers: [PolygonscanService],
  exports: [PolygonscanService],
})
export class PolygonscanModule {}
