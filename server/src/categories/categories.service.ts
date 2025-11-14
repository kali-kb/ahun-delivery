import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { DRIZZLE_ORM } from '../../constants';
import { schema } from '../../db/schema/index';
import { CreateCategoryDto } from './dto/create_category.dto';


@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Example method to get all categories
  async findAllCategories() {
    return this.db.query.categories.findMany();
  }

  async createCategory(category: CreateCategoryDto) {
    return this.db.insert(schema.categories).values({ name: category.name, image: category.image, description: category.description }).returning();
  }

  async findCategoryById(id: number, userId?: string) {
    // console.log(userId, 'userId');
    const menuRatingsAgg = this.db
      .select({
        menuId: schema.menuRatings.menuitemId,
        avgRating: sql<number>`coalesce(avg(${schema.menuRatings.starRating}), 0)`.as('avg_rating'),
        reviewsCount: sql<number>`count(${schema.menuRatings.id})`.as('reviews_count'),
      })
      .from(schema.menuRatings)
      .groupBy(schema.menuRatings.menuitemId)
      .as('menu_ratings_agg');

    const categoryWithMenus = await this.db
      .select({
        ...getTableColumns(schema.categories),
        menus: sql`
          json_agg(json_strip_nulls(
            json_build_object(
              'id', ${schema.menus.id},
              'name', ${schema.menus.name},
              'item_img', ${schema.menus.item_img},
              'description', ${schema.menus.description},
              'price', ${schema.menus.price},
              'isAvailable', ${schema.menus.isAvailable},
              'restaurant', json_build_object('name', ${schema.restaurants.name}),
              'avgRating', ${menuRatingsAgg.avgRating},
              'reviewsCount', ${menuRatingsAgg.reviewsCount},
              'isFavorited', EXISTS (
                  SELECT 1 FROM ${schema.favorites}
                  WHERE ${schema.favorites.menuItemId} = ${schema.menus.id}
                  AND ${schema.favorites.userId} = ${userId || 'NULL'}
              )
            )
          ))
        `,
      })
      .from(schema.categories)
      .leftJoin(schema.menus, eq(schema.categories.id, schema.menus.categoryId))
      .leftJoin(schema.restaurants, eq(schema.menus.restaurantId, schema.restaurants.id))
      .leftJoin(menuRatingsAgg, eq(schema.menus.id, menuRatingsAgg.menuId))
      .where(eq(schema.categories.id, id))
      .groupBy(schema.categories.id);

    const result = categoryWithMenus[0];

    if (result) {
      if (!result.menus) {
        result.menus = [];
      } else if (Array.isArray(result.menus)) {
        // Filter out invalid menu objects (when leftJoin returns no menus, json_agg creates objects with null ids)
        result.menus = result.menus.filter(menu => menu !== null && menu.id !== null);
      }
    }

    return result;
  }
}
