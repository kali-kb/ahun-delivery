import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuRatingsService } from './menu-ratings.service';
import { CreateMenuRatingDto } from './dto/create-menu-rating.dto';
import { UpdateMenuRatingDto } from './dto/update-menu-rating.dto';

@Controller('menus/:menuId/ratings')
export class MenuRatingsController {
  constructor(private readonly menuRatingsService: MenuRatingsService) {}

  @Post()
  create(
    @Param('menuId') menuId: string,
    @Body() createMenuRatingDto: CreateMenuRatingDto,
  ) {
    return this.menuRatingsService.create(+menuId, createMenuRatingDto);
  }

  @Get()
  findAll(@Param('menuId') menuId: string) {
    return this.menuRatingsService.findAll(+menuId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('menuId') menuId: string) {
    return this.menuRatingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Param('menuId') menuId: string, @Body() updateMenuRatingDto: UpdateMenuRatingDto) {
    return this.menuRatingsService.update(+id, updateMenuRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('menuId') menuId: string) {
    return this.menuRatingsService.remove(+id);
  }
}
