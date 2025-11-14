import { IsOptional, IsString, IsInt, Min, Max} from "class-validator";

export class CreateRestaurantRatingDto {

    @IsString()
    reviewerId: string;


    @IsInt()
    @Min(1)
    @Max(5)
    starRating: number;

    @IsOptional()
    @IsString()
    feedback?: string;


}
