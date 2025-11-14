import { Module } from '@nestjs/common';
import { RestaurantRatingsService } from './restaurant-ratings.service';
import { RestaurantRatingsController } from './restaurant-ratings.controller';
import { DrizzleModule } from '../../db/drizzle.module';


@Module({
  imports: [DrizzleModule],
  controllers: [RestaurantRatingsController],
  providers: [RestaurantRatingsService],
})
export class RestaurantRatingsModule {}
