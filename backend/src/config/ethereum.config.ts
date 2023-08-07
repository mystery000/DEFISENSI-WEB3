import { registerAs } from '@nestjs/config';

export interface EthereumConfig {
  network: string;
  infura_api_key: string;
  etherscanApiKey: string;
}

export default registerAs(
  'ethereum',
  (): EthereumConfig => ({
    network: process.env.ETHEREUM_NETWORK,
    infura_api_key: process.env.INFURA_API_KEY,
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
  }),
);
