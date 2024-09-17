import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser } from 'src/decorators/user-id.decorator';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class PostOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private postsService: PostsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = (request as RequestWithUser).user;
    const userId = user.userId;

    const postId = request.params.id;

    if (!postId) {
      throw new BadRequestException('Invalid or missing event ID');
    }

    const post = await this.postsService.findOne(postId);

    if (!post) {
      throw new NotFoundException(`post with ID ${postId} not found`);
    }

    return post.userId == userId;
  }
}
