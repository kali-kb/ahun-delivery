import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from '../db/drizzle.module';
// import { CategoriesModule } from './categories/categories.module';
// import { RestaurantsModule } from './restaurants/restaurants.module';
// import { MenuItemsModule } from './menu_items/menu_items.module';
import { UserModule } from './user/user.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '../lib/auth'
import { FavoritesModule } from './favorites/favorites.module';
import { PromoModule } from './promo/promo.module';
import { MenuRatingsModule } from './menu-ratings/menu-ratings.module';
import { RestaurantRatingsModule } from './restaurant-ratings/restaurant-ratings.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoriesModule } from './categories/categories.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuItemsModule } from './menus/menus.module';
import { PaymentModule } from './payments/payment.module';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';


@Module({
  // imports: [DrizzleModule, CategoriesModule, RestaurantsModule, MenuItemsModule, UserModule, AuthModule.forRoot({auth})],
  imports: [DrizzleModule, UserModule, AuthModule.forRoot({auth}), CategoriesModule, RestaurantsModule, MenuItemsModule, FavoritesModule, PromoModule, MenuRatingsModule, RestaurantRatingsModule, CartItemsModule, OrdersModule, NotificationsModule, PaymentModule, PushNotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

