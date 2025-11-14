import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('users/:userId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Param('userId') userId: string, @Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(userId, createNotificationDto);
  }

  @Get()
  findAllForUser(@Param('userId') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('userId') userId: string) {
    return this.notificationsService.findOne(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
