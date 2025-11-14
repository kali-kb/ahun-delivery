import { IsOptional, IsInt, Min, Max, IsString, IsNotEmpty} from "class-validator";

export class CreateMenuRatingDto {

    @IsNotEmpty()
    @IsString()
    reviewerId: string;

    @IsOptional()
    @IsString()
    feedback?: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    starRating: number;
}
