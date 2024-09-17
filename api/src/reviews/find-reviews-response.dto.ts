import { ReviewResponseDto } from './review-response.dto';

export class FindReviewsResponseDTO {
  limit: number;
  offset: number;
  search?: string;
  withUserData?: boolean;
  data: ReviewResponseDto[];
}
