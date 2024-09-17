import { IsOptional, IsString } from "class-validator";

export class UpdateHousingDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  imageURL?: string;
}