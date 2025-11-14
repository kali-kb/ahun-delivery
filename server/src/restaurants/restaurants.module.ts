import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { DrizzleModule } from '../../db/drizzle.module';

@Module({

    imports: [DrizzleModule],
    controllers: [RestaurantsController],
    providers: [RestaurantsService],
    
})
export class RestaurantsModule {}
