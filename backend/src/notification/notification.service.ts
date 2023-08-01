import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  CreateNftNotificationDto,
  CreateTokenNotificationDto,
  CreateWalletNotificationDto,
} from './dto/create-notification.dto';
import { UserService } from '../user/user.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    private readonly userService: UserService,
  ) {}

  async create(
    createNotificationDto: CreateWalletNotificationDto | CreateTokenNotificationDto | CreateNftNotificationDto,
    type: string,
  ) {
    const user = await this.userService.getByAddress(createNotificationDto.address);
    const newNotification = await this.notificationModel.create({
      status: true,
      type,
      ...createNotificationDto,
    });
    await user.updateOne({ $push: { notifications: newNotification.id } });
    return newNotification;
  }

  findAll() {
    return `This action returns all notification`;
  }

  async findOne(id: string) {
    return await this.notificationModel.findById(id);
  }

  async update(_id: string, updateNotificationDto: UpdateNotificationDto) {
    if (updateNotificationDto.type) {
      delete updateNotificationDto.type;
    }
    return await this.notificationModel.findOneAndUpdate({ _id }, updateNotificationDto, { new: true });
  }

  async remove(_id: string) {
    await this.notificationModel.findOneAndRemove({ _id });
    return new SuccessResponse(true);
  }
}
