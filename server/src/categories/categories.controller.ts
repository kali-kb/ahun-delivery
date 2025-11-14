import { Controller, Get, Post, Body, Param, ParseIntPipe, Query} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create_category.dto';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';


@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    async findAll() {
        return this.categoriesService.findAllCategories();
    }
    @Get(':id')
    async findOne(@Session() userSession: UserSession, @Param('id', ParseIntPipe) id: number) {
        // console.log(userId, 'Session')
        const { user } = userSession
        return this.categoriesService.findCategoryById(id, user.id);
    }

    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.createCategory(createCategoryDto);
    }
}
