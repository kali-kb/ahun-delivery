import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MenuItemsService } from './menus.service';



@Controller('menus')
export class MenusController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  // GET /menus - returns ALL menu items
  @Get()
  findAll() {
    // This method should be implemented in the service
    return this.menuItemsService.findAllGlobal();
  }

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('isVegetarian') isVegetarian?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.menuItemsService.searchMenu(
      query,
      isVegetarian === 'true' ? true : undefined,
      maxPrice ? parseInt(maxPrice) : undefined,
    );
  }

  @Get('popular/nearby')
  findPopularNearby(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('limit') limit?: string,
  ) {
    return this.menuItemsService.findPopularNearby(
      lat,
      lon,
      limit ? parseInt(limit) : 10,
    );
  }


  // GET /menus/:id - returns a menu item by its primary key
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // This method should be implemented in the service
    return this.menuItemsService.findOneById(id);
  }

  // GET /menus/:id/drinks - returns drinks from the same restaurant
  @Get(':id/drinks')
  findDrinks(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.findDrinksByRestaurant(id);
  }
}
