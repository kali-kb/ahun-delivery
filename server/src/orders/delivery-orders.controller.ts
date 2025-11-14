import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('delivery/:deliveryPersonId/orders')
export class DeliveryOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAllForDeliveryPerson(@Param('deliveryPersonId') deliveryPersonId: string) {
    return this.ordersService.findAllForDeliveryPerson(deliveryPersonId);
  }

  @Patch(':orderId')
  update(
    @Param('deliveryPersonId') deliveryPersonId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(+orderId, updateOrderDto);
  }
}