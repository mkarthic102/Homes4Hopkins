import { IsString } from "class-validator";

export class UserLoginDTO {
  @IsString()
  password: string;
  @IsString()
  email: string;
  }
  