import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RestaurantOrdersController } from './restaurant-orders.controller';
import { DeliveryOrdersController } from './delivery-orders.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { DrizzleModule } from '../../db/drizzle.module';

@Module({
  imports: [DrizzleModule, NotificationsModule, PushNotificationsModule],
  controllers: [OrdersController, RestaurantOrdersController, DeliveryOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
