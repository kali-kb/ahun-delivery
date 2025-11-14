import { IsOptional, IsString, IsNotEmpty, IsInt, MinLength } from "class-validator";

export class CreateOrderDto {

    @IsInt()
    @IsNotEmpty()
    restaurantId: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    deliveryAddress: string;

    @IsOptional()
    @IsString()
    deliveryPersonId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
