import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindHousingsQueryDTO {
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDistance?: number;

  @IsString()
  @IsOptional()
  price?: string;

}
