import { registerAs } from '@nestjs/config';

export interface MoralisConfig {
  secretKey: string;
}

export default registerAs(
  'moralis',
  (): MoralisConfig => ({
    secretKey: process.env.MORALIS_SECRET_KEY || '',
  }),
);
