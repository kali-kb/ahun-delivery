import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantRatingsService } from './restaurant-ratings.service';
import { CreateRestaurantRatingDto } from './dto/create-restaurant-rating.dto';
import { UpdateRestaurantRatingDto } from './dto/update-restaurant-rating.dto';

@Controller('restaurants/:restaurantId/ratings')
export class RestaurantRatingsController {
  constructor(private readonly restaurantRatingsService: RestaurantRatingsService) {}

  @Post()
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() createRestaurantRatingDto: CreateRestaurantRatingDto,
  ) {
    return this.restaurantRatingsService.create(+restaurantId, createRestaurantRatingDto);
  }

  @Get()
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.restaurantRatingsService.findAll(+restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('restaurantId') restaurantId: string) {
    return this.restaurantRatingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestaurantRatingDto: UpdateRestaurantRatingDto) {
    return this.restaurantRatingsService.update(+id, updateRestaurantRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantRatingsService.remove(+id);
  }
}
