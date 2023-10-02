import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@ApiTags('Mailing')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('/send-email')
  async sendEmail() {}
}
