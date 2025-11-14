import { IsNumber, IsNotEmpty, IsInt, Min, Max } from "class-validator";

export class CreateCartItemDto {

    @IsInt()
    @Min(1)
    @Max(5)
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    menuItemId: number;
}
