import {  IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';


export class CreateCategoryDto {

    @IsOptional()
    @IsNumber()
    id?: number;


    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    image: string;


    @IsOptional()
    @IsString()
    description?: string;

}