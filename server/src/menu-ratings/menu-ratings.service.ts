import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuRatingDto } from './dto/create-menu-rating.dto';
import { UpdateMenuRatingDto } from './dto/update-menu-rating.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class MenuRatingsService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  create(menuId: number, createMenuRatingDto: CreateMenuRatingDto) {
    return this.db
      .insert(schema.menuRatings)
      .values({ ...createMenuRatingDto, menuitemId: menuId })
      .returning();
  }

  findAll(menuId: number) {
    return this.db.query.menuRatings.findMany({
      where: eq(schema.menuRatings.menuitemId, menuId),
    });
  }

  findOne(id: number) {
    return this.db.query.menuRatings.findFirst({
      where: eq(schema.menuRatings.id, id),
    });
  }

  update(id: number, updateMenuRatingDto: UpdateMenuRatingDto) {
    return this.db
      .update(schema.menuRatings)
      .set(updateMenuRatingDto)
      .where(eq(schema.menuRatings.id, id))
      .returning();
  }

  remove(id: number) {
    return this.db
      .delete(schema.menuRatings)
      .where(eq(schema.menuRatings.id, id))
      .returning();
  }
}
