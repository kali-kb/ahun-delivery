import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';


@AllowAnonymous()
@Controller('users/:userId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Param('userId') userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(userId, createOrderDto);
  }

  @Post('bulk')
  createMultiRestaurant(
    @Param('userId') userId: string, 
    @Body() body: { deliveryAddress: string; notes?: string }
  ) {
    return this.ordersService.createMultiRestaurantOrders(userId, body.deliveryAddress, body.notes);
  }

  @Get()
  findAllForUser(@Param('userId') userId: string) {
    return this.ordersService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
