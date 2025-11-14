import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuRatingDto } from './create-menu-rating.dto';

export class UpdateMenuRatingDto extends PartialType(CreateMenuRatingDto) {}
