import { PartialType } from '@nestjs/swagger';

import { Notification } from '../schemas/notification.schema';

export class UpdateNotificationDto extends PartialType(Notification) {}
