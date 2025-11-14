import { Controller, Post, Body, Param } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';



@Controller('users/:userId/push-token')
export class PushNotificationsController {
  constructor(private readonly pushNotificationsService: PushNotificationsService) {}

  @Post()
  updatePushToken(
    @Param('userId') userId: string,
    @Body('pushToken') pushToken: string,
  ) {
    return this.pushNotificationsService.updatePushToken(userId, pushToken);
  }
}
