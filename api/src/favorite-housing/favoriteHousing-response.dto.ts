import { HousingResponseDTO } from "src/housing/housing-reponse.dto";
import { UserResponseDTO } from "src/user/user-response.dto";

export class favoriteHousingResponseDto {
  id: string;
  housing?: HousingResponseDTO;
  user?: UserResponseDTO;
}