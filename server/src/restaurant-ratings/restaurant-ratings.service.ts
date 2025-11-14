import { Inject, Injectable } from '@nestjs/common';
import { CreateRestaurantRatingDto } from './dto/create-restaurant-rating.dto';
import { UpdateRestaurantRatingDto } from './dto/update-restaurant-rating.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class RestaurantRatingsService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  create(restaurantId: number, createRestaurantRatingDto: CreateRestaurantRatingDto) {
    return this.db
      .insert(schema.restaurantRatings)
      .values({ ...createRestaurantRatingDto, restaurantId: restaurantId })
      .returning();
  }

  findAll(restaurantId: number) {
    return this.db.query.restaurantRatings.findMany({
      where: eq(schema.restaurantRatings.restaurantId, restaurantId),
    });
  }

  findOne(id: number) {
    return this.db.query.restaurantRatings.findFirst({
      where: eq(schema.restaurantRatings.id, id),
    });
  }

  update(id: number, updateRestaurantRatingDto: UpdateRestaurantRatingDto) {
    return this.db
      .update(schema.restaurantRatings)
      .set(updateRestaurantRatingDto)
      .where(eq(schema.restaurantRatings.id, id))
      .returning();
  }

  remove(id: number) {
    return this.db
      .delete(schema.restaurantRatings)
      .where(eq(schema.restaurantRatings.id, id))
  }

}

  
