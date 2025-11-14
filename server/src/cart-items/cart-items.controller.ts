import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';



@Controller('users/:userId/cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  create(
    @Param('userId') userId: string,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartItemsService.create(userId, createCartItemDto);
  }

  @Get()
  findAll(@Param('userId') userId: string) {
    return this.cartItemsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('userId') userId: string) {
    return this.cartItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Param('userId') userId: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartItemsService.update(+id, updateCartItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id:string, @Param('userId') userId: string) {
    return this.cartItemsService.remove(+id);
  }
}
