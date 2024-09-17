import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserId } from 'src/decorators/user-id.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { favoritePostResponseDto } from './favoritePost-response.dto';
import { FavoritePostService } from './favorite-post.service';
import { Post as PostType } from 'src/posts/post.entity';

@Controller('users/:userId/favoritePosts')
export class FavoritePostController {
  constructor(private readonly favoritePostService: FavoritePostService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  async create(
    @Param('postId') postId: string,
    @UserId() userId: number,
  ): Promise<favoritePostResponseDto> {
    const favorite_post = await this.favoritePostService.create(postId, userId);
    delete favorite_post.userId;
    return favorite_post;
  }
 
  // Finds whether a given user has liked a given post,
  // returns null if not
  @Get(':postId')
  async findOne(
    @Param('userId') userId: number,
    @Param('postId') postId: string,
  ): Promise<favoritePostResponseDto> {
    const favorite_post = await this.favoritePostService.findOne(
      userId,
      postId,
    );
    if (!favorite_post) {
      return { id: null };
    }
    return {
      id: favorite_post.id,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  async remove(
    @Param('userId') userId: number,
    @Param('postId') postId: string,
  ): Promise<{ statusCode: number; message: string }> {
    const favorite_post = await this.favoritePostService.remove(userId, postId);
    if (!favorite_post) {
      throw new NotFoundException(
        `User with ID ${userId} not found in favorites list of post with ID ${postId}`,
      );
    }

    return {
      statusCode: 200,
      message: 'favoritePost deleted successfully',
    };
  }

  // Find all posts liked by a user
  @Get()
  async findAll(@Param('userId') userId: number): Promise<PostType[] | null> {
    const favorite_posts = await this.favoritePostService.findAll(userId);
    return favorite_posts;
  }
}

