import { PostResponseDto } from "src/posts/post-response.dto";
import { UserResponseDTO } from "src/user/user-response.dto";

export class favoritePostResponseDto {
  id: string;
  post?: PostResponseDto;
  user?: UserResponseDTO;
}