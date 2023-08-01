import { registerAs } from '@nestjs/config';

export interface EthereumConfig {
  provider: string;
  etherscanApiKey: string;
}

export default registerAs(
  'ethereum',
  (): EthereumConfig => ({
    provider: process.env.ETHEREUM_PROVIDER,
    etherscanApiKey: process.env.MAINNET_ETHERSCAN_API_KEY,
  }),
);
