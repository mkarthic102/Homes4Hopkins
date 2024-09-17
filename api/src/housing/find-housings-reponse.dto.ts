import { HousingResponseDTO } from './housing-reponse.dto';

export class FindHousingsResponseDTO {
  limit: number;
  offset: number;
  search?: string;
  maxDistance?: number;
  price?: string;
  data: HousingResponseDTO[];
}
