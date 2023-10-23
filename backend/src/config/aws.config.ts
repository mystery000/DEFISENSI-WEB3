import { registerAs } from '@nestjs/config';

export interface AWSConfig {
  region: string;
  access_key: string;
  secret_access_key: string;
}

export default registerAs(
  'aws',
  (): AWSConfig => ({
    region: process.env.AWS_SES_REGION,
    access_key: process.env.AWS_ACCESS_KEY,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  }),
);
