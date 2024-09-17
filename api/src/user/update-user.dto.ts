import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsNumber()
  notifications: number;

  @IsOptional()
  @IsString()
  age: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  major: string;

  @IsOptional()
  @IsString()
  gradYear: string;

  @IsOptional()
  @IsString()
  stayLength: string;

  @IsOptional()
  @IsString()
  budget: string;

  @IsOptional()
  @IsString()
  idealDistance: string;

  @IsOptional()
  @IsString()
  petPreference: string;

  @IsOptional()
  @IsString()
  cleanliness: string;

  @IsOptional()
  @IsString()
  smoker: string;

  @IsOptional()
  @IsString()
  socialPreference: string;

  @IsOptional()
  @IsString()
  peakProductivity: string;
}
