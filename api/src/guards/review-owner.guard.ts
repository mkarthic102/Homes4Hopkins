import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser } from 'src/decorators/user-id.decorator';
import { ReviewsService } from 'src/reviews/reviews.service';

@Injectable()
export class ReviewOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private reviewsService: ReviewsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = (request as RequestWithUser).user;
    const userId = user.userId;

    const reviewId = request.params.reviewId;
    const housingId = request.params.housingId;

    if (!housingId) {
      throw new BadRequestException('Invalid or missing housing ID');
    }

    if (!reviewId) {
      throw new BadRequestException('Invalid or missing review ID');
    }

    const review = await this.reviewsService.findOne(reviewId, housingId);

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return review.userId == userId;
  }
}
