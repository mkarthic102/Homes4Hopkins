import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Housing } from './housing.entity';
import { Repository } from 'typeorm';
import { CreateHousingDTO } from './create-housing.dto';
import { UpdateHousingDTO } from './update-housing.dto';
import OpenAI from 'openai';
import { Review } from 'src/reviews/review.entity';
import { createAggregateReviewPrompt } from 'src/chatgpt-prompts';

const API_URL = 'http://localhost:3000';
const API_KEY = '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';
const openai = new OpenAI({ apiKey: API_KEY });

@Injectable()
export class HousingService {
  constructor(
    @InjectRepository(Housing)
    private housingRepository: Repository<Housing>,
  ) {}

  async create(createHousingDto: CreateHousingDTO): Promise<Housing> {
    const housing = this.housingRepository.create(createHousingDto);
    return this.housingRepository.save(housing);
  }

  async findAll(
    limit: number,
    offset: number,
    search?: string,
    maxDistance?: number,
    price?: string,
  ): Promise<Housing[]> {
    const queryBuilder = this.housingRepository.createQueryBuilder('housings');

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);
    queryBuilder.orderBy('housings.name', 'ASC');

    let hasWhereCondition = false;

    if (search !== undefined) {
      queryBuilder.where('housings.name ILIKE :search', {
        search: `%${search}%`,
      });
      hasWhereCondition = true;
    }

    // for the max distance
    if (maxDistance !== undefined) {
      if (hasWhereCondition) {
        queryBuilder.andWhere('housings.distance <= :maxDistance', {
          maxDistance,
        });
      } else {
        queryBuilder.where('housings.distance <= :maxDistance', {
          maxDistance,
        });
        hasWhereCondition = true;
      }
    }

    if (price !== undefined) {
      if (hasWhereCondition) {
        queryBuilder.andWhere('housings.price <= :price', {
          price,
        });
      } else {
        queryBuilder.where('housings.price <= :price', {
          price,
        });
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Housing | null> {
    return this.housingRepository
      .createQueryBuilder('housing')
      .leftJoinAndSelect('housing.reviews', 'reviews')
      .where('housing.id = :id', { id })
      .getOne();
  }

  async update(
    id: string,
    updateHousingDto: UpdateHousingDTO,
  ): Promise<Housing | null> {
    const housing = await this.housingRepository.preload({
      id,
      ...updateHousingDto,
    });
    if (!housing) {
      return null;
    }
    return this.housingRepository.save(housing);
  }

  async remove(id: string): Promise<Housing | null> {
    const housing = await this.findOne(id);
    if (!housing) {
      return null;
    }
    return this.housingRepository.remove(housing);
  }

  async updateAggregateReviewAfterCreate(
    content: string,
    id: string,
  ): Promise<null> {
    // make sure housing item exists
    const housing = await this.findOne(id);
    if (!housing) {
      return null;
    }

    // get reviews associated with housing
    const response = await fetch(`${API_URL}/housings/${id}/reviews`);
    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} - ${responseJson.message || response.statusText}`,
      );
    }
    const reviews = responseJson.data;

    let allReviews = reviews.map((review) => review.content).join(' | ');

    // Assuming allReviews is a string containing reviews separated by ' | '
    const allReviewsArray = allReviews.split(' | ');

    // Pushing new content to the array
    allReviewsArray.push(content);

    // Joining the array elements with ' | ' separator
    allReviews = allReviewsArray.join(' | ');
    const prompt = createAggregateReviewPrompt(allReviews);

    // api request body along with response
    const completion = await openai.chat.completions.create(prompt);

    // throw an error if api response is null
    if (!completion) {
      throw new Error('Failed to fetch data from API');
    }

    const newAggregateReview = completion.choices[0].message.content;
    if (
      newAggregateReview !==
      'Not enough information to create an aggregate review'
    ) {
      housing.aggregateReview = newAggregateReview;
      await this.housingRepository.save(housing);
    }
  }

  async updateAvgReviewAfterCreate(
    newRating: number,
    id: string,
  ): Promise<Housing | null> {
    const housing = await this.findOne(id);
    if (!housing) {
      return null;
    }

    let reviewSum = 0;
    if (newRating > -1) {
      reviewSum = housing.avgRating * housing.reviewCount;
    }

    reviewSum = reviewSum + newRating;
    housing.reviewCount = housing.reviewCount + 1;
    housing.avgRating = reviewSum / housing.reviewCount;
    await this.housingRepository.save(housing);
    return housing;
  }

  async updateAvgReviewAfterDelete(
    deletedRating: number,
    id: string,
  ): Promise<Housing | null> {
    const housing = await this.findOne(id);
    if (!housing) {
      return null;
    }

    let reviewSum = housing.avgRating * housing.reviewCount;

    reviewSum = reviewSum - deletedRating;
    housing.reviewCount = housing.reviewCount - 1;

    if (housing.reviewCount > 0) {
      housing.avgRating = reviewSum / housing.reviewCount;
    } else {
      housing.avgRating = 0; // Set to a default value, like 0, when there are no reviews
    }
    await this.housingRepository.save(housing);
    return housing;
  }

  async updateAggregateReviewAfterDelete(
    toBeDeletedReview: Review,
    id: string,
  ): Promise<null> {
    // make sure housing item exists
    const housing = await this.findOne(id);
    if (!housing) {
      return null;
    }

    // get reviews associated with housing
    const response = await fetch(`${API_URL}/housings/${id}/reviews`);
    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} - ${responseJson.message || response.statusText}`,
      );
    }
    const reviews = responseJson.data;
    // Filter out the review with the specific ID only for this copy of reviews
    const updatedReviews = reviews.filter(
      (review) => review.id !== toBeDeletedReview.id,
    );
    //map all the updated reviews into one string for processing
    const allReviews = updatedReviews
      .map((review) => review.content)
      .join(' | ');

    //If there is more than one review, then call chatgpt, otherwise set the value of the aggregateReview to null
    if (updatedReviews.length > 0) {
      const prompt = createAggregateReviewPrompt(allReviews);

      // api request body along with response
      const completion = await openai.chat.completions.create(prompt);

      // throw an error if api response is null
      if (!completion) {
        throw new Error('Failed to fetch data from API');
      }
      housing.aggregateReview = completion.choices[0].message.content;
    } else {
      housing.aggregateReview = null;
    }
    await this.housingRepository.save(housing);
  }
}
