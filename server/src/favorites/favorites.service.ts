import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from '../../constants';
import { schema } from '../../db/schema/index';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class FavoritesService {
  
  constructor(@Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
    ) {}
    
    
  async create(userId: string, createFavoriteDto: CreateFavoriteDto) {
    // Check if favorite already exists
    const existing = await this.db.query.favorites.findFirst({
      where: and(
        eq(schema.favorites.userId, userId),
        eq(schema.favorites.menuItemId, createFavoriteDto.menuItemId)
      )
    });

    if (existing) {
      throw new ConflictException('This item is already in your favorites');
    }

    return this.db.insert(schema.favorites).values({userId, ...createFavoriteDto}).returning();
  }

  findAll(userId: string) {
    return this.db.query.favorites.findMany({
      where: eq(schema.favorites.userId, userId),
      with: {
        menuItem: true
      } 
    });
  }

  findOne(id: number) {
    return this.db.query.favorites.findFirst({
      where: eq(schema.favorites.id, id),
    });
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return this.db.update(schema.favorites).set(updateFavoriteDto).where(eq(schema.favorites.id, id));
  }

  remove(id: number) {
    return this.db.delete(schema.favorites).where(eq(schema.favorites.id, id));
  }
}
