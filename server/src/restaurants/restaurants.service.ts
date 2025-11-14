import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { DRIZZLE_ORM } from '../../constants';
import { schema } from '../../db/schema/index';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
    constructor(
        @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
    ) {}

    getAllRestaurants() {
        return this.db.query.restaurants.findMany();
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto) {
        return this.db.insert(schema.restaurants).values(createRestaurantDto).returning();
    }

    async getRestaurantById(id: number) {
        const restaurantRatingsAgg = this.db
            .select({
                restaurantId: schema.restaurantRatings.restaurantId,
                avgRating: sql<number>`coalesce(avg(${schema.restaurantRatings.starRating}), 0)`.as('avg_rating'),
                ratingCount: sql<number>`count(${schema.restaurantRatings.id})`.as('rating_count'),
            })
            .from(schema.restaurantRatings)
            .groupBy(schema.restaurantRatings.restaurantId)
            .as('restaurant_ratings_agg');

        const restaurantWithDetails = await this.db
            .select({
                ...getTableColumns(schema.restaurants),
                avgRating: restaurantRatingsAgg.avgRating,
                ratingCount: restaurantRatingsAgg.ratingCount,
                menus: sql`json_agg(json_strip_nulls(row_to_json(${schema.menus})))`,
            })
            .from(schema.restaurants)
            .leftJoin(restaurantRatingsAgg, eq(schema.restaurants.id, restaurantRatingsAgg.restaurantId))
            .leftJoin(schema.menus, eq(schema.restaurants.id, schema.menus.restaurantId))
            .where(eq(schema.restaurants.id, id))
            .groupBy(schema.restaurants.id, restaurantRatingsAgg.avgRating, restaurantRatingsAgg.ratingCount);

        return restaurantWithDetails[0];
    }
}
