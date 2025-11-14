import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq, sql, getTableColumns, lte } from 'drizzle-orm';
import { DRIZZLE_ORM } from '../../constants';
import { schema } from '../../db/schema/index';
import { MenuItem } from '../../db/schema/menus';
import { CreateMenuItemDto } from './dto/create_menu_item.dto';

type NewMenuItem = typeof schema.menus.$inferInsert;

@Injectable()
export class MenuItemsService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(
    restaurantId: number,
    data: CreateMenuItemDto,
  ): Promise<MenuItem[]> {
    return this.db
      .insert(schema.menus)
      .values({ ...data, restaurantId })
      .returning();
  }

  async findAll(restaurantId: number): Promise<MenuItem[]> {
    return this.db.query.menus.findMany({
      where: eq(schema.menus.restaurantId, restaurantId),
    });
  }

  async findOne(
    restaurantId: number,
    menuItemId: number,
  ): Promise<MenuItem | undefined> {
    return this.db.query.menus.findFirst({
      where: and(
        eq(schema.menus.restaurantId, restaurantId),
        eq(schema.menus.id, menuItemId),
      ),
    });
  }

  // Fetch all menu items (no restaurant filter)
  async findAllGlobal(): Promise<MenuItem[]> {
    return this.db.query.menus.findMany();
  }

  async searchMenu(
    query: string,
    isVegetarian?: boolean,
    maxPrice?: number,
  ): Promise<MenuItem[]> {
    let whereConditions = [sql`LOWER(${schema.menus.name}) LIKE LOWER(${'%' + query + '%'})`];

    if (maxPrice !== undefined) {
      whereConditions.push(sql`${schema.menus.price} <= ${maxPrice}`);
    }

    if (isVegetarian !== undefined) {
      whereConditions.push(
        sql`${schema.menus.metadata}->>'is_vegetarian' = ${isVegetarian.toString()}`,
      );
    }

    const results = await this.db
      .select()
      .from(schema.menus)
      .where(and(...whereConditions));

    return results;
  }

  // Fetch single menu item by global id (PK) with rating stats
  async findOneById(id: number): Promise<any> {
    const menuRatingsAgg = this.db
      .select({
        menuId: schema.menuRatings.menuitemId,
        avgRating: sql<number>`coalesce(avg(${schema.menuRatings.starRating}), 0)`.as('avg_rating'),
        reviewsCount: sql<number>`count(${schema.menuRatings.id})`.as('reviews_count'),
      })
      .from(schema.menuRatings)
      .where(eq(schema.menuRatings.menuitemId, id))
      .groupBy(schema.menuRatings.menuitemId)
      .as('menu_ratings_agg');

    // Compose the query for the menu item and aggregates
    const result = await this.db
      .select({
        ...getTableColumns(schema.menus),
        restaurant: sql`json_build_object('name', ${schema.restaurants.name})`,
        avgRating: menuRatingsAgg.avgRating,
        reviewsCount: menuRatingsAgg.reviewsCount
      })
      .from(schema.menus)
      .leftJoin(schema.restaurants, eq(schema.menus.restaurantId, schema.restaurants.id))
      .leftJoin(menuRatingsAgg, eq(schema.menus.id, menuRatingsAgg.menuId))
      .where(eq(schema.menus.id, id));

    return result[0];
  }

  // Fetch popular menu items near a user's location
  async findPopularNearby(userLat?: string, userLon?: string, limit: number = 10): Promise<any[]> {
    const menuRatingsAgg = this.db
      .select({
        menuId: schema.menuRatings.menuitemId,
        avgRating: sql<number>`avg(${schema.menuRatings.starRating})`.as('avg_rating'),
        reviewsCount: sql<number>`count(${schema.menuRatings.id})`.as('reviews_count'),
      })
      .from(schema.menuRatings)
      .groupBy(schema.menuRatings.menuitemId)
      .as('menu_ratings_agg');

    // If user location is provided, calculate distance and sort by it
    if (userLat && userLon) {
      const popularItems = await this.db
        .select({
          ...getTableColumns(schema.menus),
          restaurant: sql`json_build_object('name', ${schema.restaurants.name}, 'location', ${schema.restaurants.location})`,
          avgRating: menuRatingsAgg.avgRating,
          reviewsCount: menuRatingsAgg.reviewsCount,
          distance: sql<number>`
            6371 * acos(
              cos(radians(${userLat}::float)) * 
              cos(radians(${schema.restaurants.latitude}::float)) * 
              cos(radians(${schema.restaurants.longitude}::float) - radians(${userLon}::float)) + 
              sin(radians(${userLat}::float)) * 
              sin(radians(${schema.restaurants.latitude}::float))
            )
          `.as('distance'),
        })
        .from(schema.menus)
        .innerJoin(schema.restaurants, eq(schema.menus.restaurantId, schema.restaurants.id))
        .innerJoin(menuRatingsAgg, eq(schema.menus.id, menuRatingsAgg.menuId))
        .where(
          and(
            eq(schema.menus.isAvailable, true),
            sql`${schema.restaurants.latitude} IS NOT NULL`,
            sql`${schema.restaurants.longitude} IS NOT NULL`,
            sql`${menuRatingsAgg.reviewsCount} > 0`
          )
        )
        .orderBy(sql`distance ASC, ${menuRatingsAgg.avgRating} DESC`)
        .limit(limit);

      return popularItems;
    }

    // Fallback: just return popular items by rating if no location
    const popularItems = await this.db
      .select({
        ...getTableColumns(schema.menus),
        restaurant: sql`json_build_object('name', ${schema.restaurants.name}, 'location', ${schema.restaurants.location})`,
        avgRating: menuRatingsAgg.avgRating,
        reviewsCount: menuRatingsAgg.reviewsCount,
      })
      .from(schema.menus)
      .innerJoin(schema.restaurants, eq(schema.menus.restaurantId, schema.restaurants.id))
      .innerJoin(menuRatingsAgg, eq(schema.menus.id, menuRatingsAgg.menuId))
      .where(
        and(
          eq(schema.menus.isAvailable, true),
          sql`${menuRatingsAgg.reviewsCount} > 0`
        )
      )
      .orderBy(sql`${menuRatingsAgg.avgRating} DESC`)
      .limit(limit);

    return popularItems;
  }

  // Fetch drinks from the same restaurant, excluding the current menu item
  async findDrinksByRestaurant(menuItemId: number, drinkCategoryName: string = 'Drinks'): Promise<any[]> {
    // First get the restaurant ID and category ID for drinks
    const menuItem = await this.db.query.menus.findFirst({
      where: eq(schema.menus.id, menuItemId),
    });

    if (!menuItem) return [];

    const drinkCategory = await this.db.query.categories.findFirst({
      where: sql`LOWER(${schema.categories.name}) = LOWER(${drinkCategoryName})`,
    });

    if (!drinkCategory) return [];

    // Fetch drinks from the same restaurant
    const menuRatingsAgg = this.db
      .select({
        menuId: schema.menuRatings.menuitemId,
        avgRating: sql<number>`coalesce(avg(${schema.menuRatings.starRating}), 0)`.as('avg_rating'),
        reviewsCount: sql<number>`count(${schema.menuRatings.id})`.as('reviews_count'),
      })
      .from(schema.menuRatings)
      .groupBy(schema.menuRatings.menuitemId)
      .as('menu_ratings_agg');

    const drinks = await this.db
      .select({
        ...getTableColumns(schema.menus),
        avgRating: menuRatingsAgg.avgRating,
        reviewsCount: menuRatingsAgg.reviewsCount,
      })
      .from(schema.menus)
      .leftJoin(menuRatingsAgg, eq(schema.menus.id, menuRatingsAgg.menuId))
      .where(
        and(
          eq(schema.menus.restaurantId, menuItem.restaurantId),
          eq(schema.menus.categoryId, drinkCategory.id),
          eq(schema.menus.isAvailable, true),
        ),
      )
      .limit(6);

    return drinks;
  }
}
