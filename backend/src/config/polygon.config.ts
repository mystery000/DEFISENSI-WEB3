import { registerAs } from '@nestjs/config';

export interface PolygonConfig {
  network: string;
  infura_api_key: string;
  polygonscanApiKey: string;
}

export default registerAs(
  'polygon',
  (): PolygonConfig => ({
    network: process.env.POLYGON_NETWORK,
    infura_api_key: process.env.INFURA_API_KEY,
    polygonscanApiKey: process.env.POLYGONSCAN_API_KEY,
  }),
);
