import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Moralis from 'moralis';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {
    Moralis.start({
      apiKey: this.configService.get<string>('MORALIS_SECRET_KEY'),
    });
  }
  getHello(): string {
    return 'Welcome to Defisensi!';
  }
}
