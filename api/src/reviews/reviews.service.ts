import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './create-review.dto';
import { HousingService } from 'src/housing/housing.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private housingService: HousingService,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    housingId: string,
    userId: number,
  ): Promise<Review | null> {
    const review = await this.reviewRepository.create({
      ...createReviewDto,
      housingId,
      userId,
    });

    // Increment review count by 1 and update average rating for housing item
    await this.housingService.updateAvgReviewAfterCreate(
      review.rating,
      housingId,
    );
    // Update aggregate review
    await this.housingService.updateAggregateReviewAfterCreate(
      review.content,
      housingId,
    );

    return this.reviewRepository.save(review);
    // return review;
  }

  async findOne(id: string, housingId: string): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: {
        id,
        housingId,
      },
    });
  }

  async remove(id: string, housingId: string): Promise<Review | null> {
    const review = await this.findOne(id, housingId);
    if (!review) {
      return null;
    }

    // Create new Aggregate review without the to-be-deleted review
    await this.housingService.updateAggregateReviewAfterDelete(
      review,
      housingId,
    );

    // Decrement review count by 1 and update average review of housing item
    await this.housingService.updateAvgReviewAfterDelete(
      review.rating,
      housingId,
    );
    return this.reviewRepository.remove(review);
  }

  // Finds all reviews for the specific housing item
  async findAll(
    limit: number,
    offset: number,
    housingId: string,
    search?: string,
    sortBy?: string,
    withUserData?: boolean,
  ): Promise<Review[] | null> {
    let query = this.reviewRepository
      .createQueryBuilder('review')
      .where('review.housingId = :housingId', { housingId })
      .orderBy('review.timestamp', 'DESC')
      .limit(limit)
      .offset(offset);

    if (search) {
      query = query.andWhere('review.content ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (withUserData) {
      query = query.leftJoinAndSelect('review.user', 'user');
    }

    if (sortBy) {
      // Handle sorting based on sortBy parameter
      switch (sortBy) {
        case 'popularity':
          query = query.orderBy('review.upvoteCount', 'DESC');
          break;
        case 'recency':
          query = query.orderBy('review.timestamp', 'DESC');
          break;
        // Add more cases for other sorting criteria if needed
        default:
          // Default to sorting by timestamp if sortBy is not recognized
          query = query.orderBy('review.timestamp', 'DESC');
          break;
      }
    }

    const reviews = await query.getMany();

    return reviews;
  }

  // Upvote a specific review
  async upvote(
    id: string,
    housingId: string,
    userId: number,
  ): Promise<Review | null> {
    const review = await this.findOne(id, housingId);
    if (!review) {
      return null;
    }
    // Check if the user has already upvoted the review
    if (review.likedBy.includes(userId)) {
      throw new Error('You have already upvoted this review');
    }
    review.upvoteCount++;
    review.likedBy.push(userId); // Add user to likedBy array
    return this.reviewRepository.save(review);
  }

  // Undo upvote a specific review
  async upvoteUndo(
    id: string,
    housingId: string,
    userId: number,
  ): Promise<Review | null> {
    const review = await this.findOne(id, housingId);
    if (!review) {
      return null;
    }
    // Check if the user has already upvoted the review
    if (!review.likedBy.includes(userId)) {
      throw new Error('You have not upvoted this review');
    }
    review.upvoteCount--;
    review.likedBy = review.likedBy.filter(
      (likedUserId) => likedUserId !== userId,
    ); // Remove user from likedBy array
    return this.reviewRepository.save(review);
  }

  async findLikedBy(id: string, housingId: string): Promise<number[]> {
    const review = await this.findOne(id, housingId);
    if (!review) {
      return null;
    }
    return review.likedBy;
  }
}
