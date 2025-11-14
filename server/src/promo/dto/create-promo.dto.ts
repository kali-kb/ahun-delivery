import { IsString, IsNotEmpty, IsDateString, IsOptional } from "class-validator";

export class CreatePromoDto {

    @IsString()
    @IsNotEmpty()
    headline: string;

    @IsString()
    @IsNotEmpty()
    subheading: string;

    @IsString()
    @IsOptional()
    cta?: string;

    @IsDateString()
    @IsNotEmpty()
    deadline: string;
}
