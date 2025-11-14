import { Module } from '@nestjs/common';
import { MenuItemsService } from './menus.service';
import { MenuItemsController as RestaurantMenuItemsController } from './restaurant-menus.controller';
import { MenusController } from './menus.controller';
import { DrizzleModule } from '../../db/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [RestaurantMenuItemsController, MenusController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
