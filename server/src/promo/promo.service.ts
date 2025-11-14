import { Inject, Injectable } from '@nestjs/common';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { eq } from 'drizzle-orm';

@Injectable()
export class PromoService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  create(createPromoDto: CreatePromoDto) {
    return this.db.insert(schema.promo).values({
      ...createPromoDto,
      deadline: new Date(createPromoDto.deadline),
    }).returning();
  }

  findAll() {
    return this.db.query.promo.findMany();
  }

  findOne(id: number) {
    return this.db.query.promo.findFirst({
      where: eq(schema.promo.id, id),
    });
  }

  update(id: number, updatePromoDto: UpdatePromoDto) {
    const { deadline, ...rest } = updatePromoDto;
    const updateData: any = {
      ...rest,
      ...(deadline && { deadline: new Date(deadline) }),
    };
    
    return this.db
      .update(schema.promo)
      .set(updateData)
      .where(eq(schema.promo.id, id))
      .returning();
  }

  remove(id: number) {
    return this.db.delete(schema.promo).where(eq(schema.promo.id, id)).returning();
  }
}
