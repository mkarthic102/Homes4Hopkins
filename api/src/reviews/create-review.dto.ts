import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Review cannot be empty' })
  content: string;

  @IsOptional()
  @IsNumber()
  rating: number;
}
