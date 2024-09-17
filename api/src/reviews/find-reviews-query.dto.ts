import {
  IsInt,
  IsOptional,
  IsPositive,
  Min,
  IsString,
  Max,
  IsBoolean,
} from 'class-validator';

export class FindReviewsQueryDTO {
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  @IsInt()
  @Min(0)
  @IsOptional()
  offset: number = 0;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsBoolean()
  @IsOptional()
  withUserData?: boolean;
}
