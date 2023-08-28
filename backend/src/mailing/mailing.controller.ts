import { Controller, Get } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { MailingService } from './mailing.service';

@ApiTags('Mailing')
@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}
  @Get('send-mail')
  public sendMail() {
    this.mailingService.sendMail();
  }
}
