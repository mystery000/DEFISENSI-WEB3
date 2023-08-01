import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import {
  CreateNftNotificationDto,
  CreateTokenNotificationDto,
  CreateWalletNotificationDto,
} from './dto/create-notification.dto';
import { Notification } from './schemas/notification.schema';
import { NotificationService } from './notification.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('wallet')
  @ApiOperation({ summary: 'Create new Wallet notification' })
  @ApiOkResponse({ type: Notification })
  createWallet(@Body() createNotificationDto: CreateWalletNotificationDto): Promise<Notification> {
    return this.notificationService.create(createNotificationDto, 'Wallet');
  }

  @Post('token')
  @ApiOperation({ summary: 'Create new Token notification' })
  @ApiOkResponse({ type: Notification })
  createToken(@Body() createNotificationDto: CreateTokenNotificationDto): Promise<Notification> {
    return this.notificationService.create(createNotificationDto, 'Token');
  }

  @Post('nft')
  @ApiOperation({ summary: 'Create new Nft notification' })
  @ApiOkResponse({ type: Notification })
  createNft(@Body() createNotificationDto: CreateNftNotificationDto): Promise<Notification> {
    return this.notificationService.create(createNotificationDto, 'Nft');
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get detail of notification by id' })
  @ApiOkResponse({ type: Notification })
  @ApiParam({ name: 'id', description: 'The id of the notification' })
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the notification by id' })
  @ApiOkResponse({ type: Notification })
  @ApiParam({ name: 'id', description: 'The id of the notification' })
  update(@Param('id') id: string, @Body() updateWalletNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateWalletNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification by id' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'id', description: 'The id of the notification' })
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
