import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { logger } from 'src/utils/logger';
import * as AWS from '@aws-sdk/client-ses';
import { createTransport } from 'nodemailer';
import { AWSConfig } from 'src/config/aws.config';
import { SmtpConfig } from 'src/config/smtp.config';
import { EmailSendingDto } from './dto/EmailSendingDto';
import { SuccessResponse } from 'src/utils/dtos/success-response';

@Injectable()
export class MailService {
  private readonly awsConfig: AWSConfig;
  private readonly smtpConfig: SmtpConfig;

  constructor(private readonly configService: ConfigService) {
    this.awsConfig = this.configService.get<AWSConfig>('aws');
    this.smtpConfig = this.configService.get<SmtpConfig>('smtp');
  }

  private createSmtpTransporter() {
    const transporter = createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: false,
      auth: {
        user: this.smtpConfig.user,
        pass: this.smtpConfig.password,
      },
    });
    return transporter;
  }

  async checkSmtpConnection(): Promise<SuccessResponse> {
    const transporter = this.createSmtpTransporter();
    try {
      const validation = await transporter.verify();
      return new SuccessResponse(true);
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
  }

  async sendEmailUsingSMTP(emailSendingDto: EmailSendingDto) {
    const transporter = this.createSmtpTransporter();
    try {
      const validation = await transporter.verify();
    } catch (error) {
      return new SuccessResponse(false, `SMTP Connection Error: ${error.message}`);
    }
    try {
      await transporter.sendMail({
        from: `${emailSendingDto.from}<${this.smtpConfig.user}>`,
        to: emailSendingDto.to,
        subject: emailSendingDto.subject,
        html: emailSendingDto.body,
      });
      return new SuccessResponse(true);
    } catch (error) {
      return new SuccessResponse(false, `SMTP Email Sending Error: ${error.message}`);
    }
  }

  async sendEmailUsingSES() {
    const client = new AWS.SES({
      region: this.awsConfig.region,
      credentials: {
        accessKeyId: this.awsConfig.access_key,
        secretAccessKey: this.awsConfig.secret_access_key,
      },
    });

    const params = {
      Source: 'lkostyrka17@gmail.com', // Replace with your email address
      Destination: {
        ToAddresses: ['thomasliu1005@gmail.com'], // Replace with recipient's email address
      },
      Message: {
        Subject: {
          Data: 'Hello from AWS SES', // Replace with your email subject
        },
        Body: {
          Text: {
            Data: 'This is the body of the email', // Replace with your email body
          },
        },
      },
    };

    client.sendEmail(params, (err, data) => {
      if (err) {
        logger.error(err);
      } else {
        logger.log('Email sent: ', data);
      }
    });
  }
}
