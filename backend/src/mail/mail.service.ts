import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SmtpConfig } from 'src/config/smtp.config';
import { SuccessResponse } from 'src/utils/dtos/success-response';
import { EmailSendingDto } from './dto/EmailSendingDto';

@Injectable()
export class MailService {
  private readonly smtpConfig: SmtpConfig;

  constructor(private readonly configService: ConfigService) {
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

  async sendEmail(emailSendingDto: EmailSendingDto) {
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

  async test() {}
}
