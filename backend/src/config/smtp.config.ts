import { registerAs } from '@nestjs/config';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export default registerAs(
  'smtp',
  (): SmtpConfig => ({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || null,
    password: process.env.SMTP_PASSWORD || null,
  }),
);
