import { Inject, Injectable } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class CartItemsService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  create(userId: string, createCartItemDto: CreateCartItemDto) {
    return this.db
      .insert(schema.cartItems)
      .values({ ...createCartItemDto, userId })
      .returning();
  }

  findAll(userId: string) {
    return this.db.query.cartItems.findMany({
      where: eq(schema.cartItems.userId, userId),
      with: {
        menuItem: {
          with: {
            restaurant: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.db.query.cartItems.findFirst({
      where: eq(schema.cartItems.id, id),
    });
  }

  update(id: number, updateCartItemDto: UpdateCartItemDto) {
    return this.db
      .update(schema.cartItems)
      .set(updateCartItemDto)
      .where(eq(schema.cartItems.id, id))
      .returning();
  }

  remove(id: number) {
    return this.db.delete(schema.cartItems).where(eq(schema.cartItems.id, id)).returning();
  }
}
