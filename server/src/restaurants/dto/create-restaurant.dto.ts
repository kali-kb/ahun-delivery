import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

}