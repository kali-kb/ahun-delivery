import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DrizzleModule } from '../../db/drizzle.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
