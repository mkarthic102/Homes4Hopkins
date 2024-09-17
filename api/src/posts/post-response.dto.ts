import { UserResponseDTO } from "src/user/user-response.dto";
import { PostType } from "./post.entity";
import { PostImage } from "./post-images/post-image.entity";

export class PostResponseDto {
    id: string;
    title: string;
    content: string;
    timestamp: Date;
    cost: number;
    address: string;
    // image?: string[];
    images: PostImage[];
    type: PostType;
    user?: UserResponseDTO;
}
  