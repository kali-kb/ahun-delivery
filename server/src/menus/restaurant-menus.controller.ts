import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MenuItemsService } from './menus.service';
import { CreateMenuItemDto } from './dto/create_menu_item.dto';


@Controller('restaurants/:restaurantId/menus')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  create(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuItemsService.create(restaurantId, createMenuItemDto);
  }
  
  @Get()
  findAll(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.menuItemsService.findAll(restaurantId);
  }

  @Get(':menuItemId')
  findOne(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('menuItemId', ParseIntPipe) menuItemId: number,
  ) {
    return this.menuItemsService.findOne(restaurantId, menuItemId);
  }
}
