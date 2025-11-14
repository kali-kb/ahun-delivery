import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('restaurants/:restaurantId/orders')
export class RestaurantOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAllForRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.findAllForRestaurant(+restaurantId);
  }

  @Patch(':orderId')
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(+orderId, updateOrderDto);
  }
}