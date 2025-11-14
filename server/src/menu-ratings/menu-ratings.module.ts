import { Module } from '@nestjs/common';
import { MenuRatingsService } from './menu-ratings.service';
import { MenuRatingsController } from './menu-ratings.controller';
import { DrizzleModule } from '../../db/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [MenuRatingsController],
  providers: [MenuRatingsService],
})
export class MenuRatingsModule {}
