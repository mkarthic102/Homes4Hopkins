import { HousingResponseDTO } from 'src/housing/housing-reponse.dto';
import { UserResponseDTO } from 'src/user/user-response.dto';

export class ReviewResponseDto {
  id: string;
  content: string;
  timestamp: Date;
  rating: number;
  upvoteCount: number;
  likedBy: number[];
  housing?: HousingResponseDTO;
  user?: UserResponseDTO;
}
