import { IsString, IsNotEmpty, IsNumber } from 'class-validator';


export class CreateFavoriteDto {

    // @IsNotEmpty()
    // @IsString()
    // userId: string;

    @IsNotEmpty()
    @IsNumber()
    menuItemId: number;
}
