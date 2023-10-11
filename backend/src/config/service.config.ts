import { registerAs } from '@nestjs/config';

export interface ServiceConfig {
  moralis_api_key: string;
  zenrows_api_key: string;
  covalenthq_api_key: string;
  chainbase_api_key: string;
}

export default registerAs(
  'service',
  (): ServiceConfig => ({
    moralis_api_key: process.env.MORALIS_SECRET_KEY,
    zenrows_api_key: process.env.ZENROWS_API_KEY,
    covalenthq_api_key: process.env.COVALENTHQ_API_KEY,
    chainbase_api_key: process.env.CHAINBASE_API_KEY,
  }),
);
