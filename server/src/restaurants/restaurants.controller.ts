import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';




@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) { }

    @Get()
    async findAll() {
        return this.restaurantsService.getAllRestaurants();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.restaurantsService.getRestaurantById(id);
    }

    @Post()
    async create(@Body() createRestaurantDto: CreateRestaurantDto) {
        return this.restaurantsService.createRestaurant(createRestaurantDto);
    }
}
