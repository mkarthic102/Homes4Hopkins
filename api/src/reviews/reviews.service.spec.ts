import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { HousingService } from 'src/housing/housing.service';
import { User } from 'src/user/user.entity';
import { Housing } from 'src/housing/housing.entity';
import { CreateReviewDto } from './create-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let repository: Repository<Review>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let housingRepository: Repository<Housing>; // Add housingRepository
  let housingService: HousingService;

  const REVIEW_REPO_TOKEN = getRepositoryToken(Review);
  const HOUSING_REPO_TOKEN = getRepositoryToken(Housing); // Add housing repository token

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        HousingService,
        {
          provide: REVIEW_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
            save: jest.fn(),
          },
        },
        {
          provide: HOUSING_REPO_TOKEN, // Provide mock for Housing Repository
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
            // Mock other methods as needed
          },
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    repository = module.get<Repository<Review>>(REVIEW_REPO_TOKEN);
    housingRepository = module.get<Repository<Housing>>(HOUSING_REPO_TOKEN); // Get housing repository
    housingService = module.get<HousingService>(HousingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockUser: User = {
    id: 1,
    password: 'hashedpassword123',
    email: 'example@jhu.edu',
    avatar: 'http://example.com/avatar.jpg',
    firstName: 'John',
    lastName: 'Doe',
    isEmailVerified: false,
    verificationToken: 'verificationToken123',
    posts: [],
    reviews: [],
    favoriteHousings: [],
    favoritePosts: [],
    bio: null,
    notifications: 0,
    age: '21',
    gender: 'Female',
    major: 'Computer Science',
    gradYear: '2030',
    stayLength: 'Summer',
    budget: '>$900',
    idealDistance: '<0.3 miles',
    petPreference: 'Pet-Free',
    cleanliness: 'Not Clean',
    smoker: 'Non-Smoker',
    socialPreference: 'Ambivert',
    peakProductivity: 'Afternoon Person',
  };

  const mockHousing: Housing = {
    id: '1',
    name: 'Example Housing',
    address: '123 Example St',
    latitude: 0,
    longitude: 0,
    imageURL: 'http://example.com/housing.jpg',
    price: '$$$',
    distance: 0.3,
    avgRating: 4,
    reviewCount: 1,
    reviews: [], // Assuming reviews are an array of Review entities
    aggregateReview: null,
  };

  const review: Review = {
    id: 'uuid-id',
    content: 'Great place to stay!',
    timestamp: new Date(),
    rating: 4,
    upvoteCount: 0,
    user: mockUser,
    userId: 1,
    likedBy: [],
    housing: mockHousing,
    housingId: '1',
    ensureRatingNonNegative() {
      if (this.rating < 0) {
        this.rating = 0; // set rating to 0 if negative
      }
    },
  };

  const updatedHousingAfterAddReview: Housing = {
    id: '1',
    name: 'Example Housing',
    address: '123 Example St',
    latitude: 0,
    longitude: 0,
    imageURL: 'http://example.com/housing.jpg',
    price: '$$$',
    distance: 0.3,
    avgRating: 4,
    reviewCount: 2,
    reviews: [review], // Assuming reviews are an array of Review entities
    aggregateReview: null,
  };

  /*
  const updatedHousingAfterDeleteReview: Housing = {
    id: '1',
    name: 'Example Housing',
    address: '123 Example St',
    latitude: 0,
    longitude: 0,
    imageURL: 'http://example.com/housing.jpg',
    price: '$$$',
    distance: 0.3,
    avgRating: 4,
    reviewCount: 1,
    reviews: [review], // Assuming reviews are an array of Review entities
    aggregateReview: null,
  };
  */

  describe('findOne', () => {
    it('should return a single review', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';

      // Mocking the ensureRatingNonNegative function
      const reviewWithNonNegRating: Review = {
        ...review,
        ensureRatingNonNegative: jest.fn(), // Mocking the function
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(reviewWithNonNegRating);

      expect(await service.findOne(reviewId, housingId)).toEqual(
        reviewWithNonNegRating,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: reviewId, housingId },
      });
    });
  });

  describe('create', () => {
    it('should create a new review and update average rating for housing', async () => {
      const createReviewDto: CreateReviewDto = {
        content: 'Great place to stay!',
        rating: 4,
      };
      const housingId = '1';
      const userId = 1;

      // Mock create method of reviewRepository to return the created review
      jest.spyOn(repository, 'create').mockReturnValueOnce(review);

      // Mock save method of reviewRepository to return the created review
      jest.spyOn(repository, 'save').mockResolvedValueOnce(review);

      // Mock updateAvgReviewAfterCreate method of housingService
      jest
        .spyOn(housingService, 'updateAvgReviewAfterCreate')
        .mockImplementationOnce(() =>
          Promise.resolve(updatedHousingAfterAddReview),
        );

      jest
        .spyOn(housingService, 'updateAggregateReviewAfterCreate')
        .mockResolvedValueOnce(undefined);

      // Call create method of ReviewsService
      const createdReview = await service.create(
        createReviewDto,
        housingId,
        userId,
      );

      // Assert that the review is created and returned
      expect(createdReview).toEqual(review);

      // Assert that create method of reviewRepository is called with correct parameters
      expect(repository.create).toHaveBeenCalledWith({
        ...createReviewDto,
        housingId,
        userId,
      });
      expect(
        housingService.updateAggregateReviewAfterCreate,
      ).toHaveBeenCalledWith(review.content, housingId);

      // Assert that save method of reviewRepository is called with correct parameters
      expect(repository.save).toHaveBeenCalledWith(review);

      // Assert that updateAvgReviewAfterCreate method of housingService is called with correct parameters
      expect(housingService.updateAvgReviewAfterCreate).toHaveBeenCalledWith(
        createReviewDto.rating,
        housingId,
      );
    });
  });

  describe('remove', () => {
    it('should remove a review and update average rating for housing', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';

      // Mock findOne method to return the review
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(review);

      // Mock housingService methods
      jest
        .spyOn(housingService, 'updateAggregateReviewAfterDelete')
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(housingService, 'updateAvgReviewAfterDelete')
        .mockResolvedValueOnce(undefined);

      // Mock reviewRepository.remove method to return the removed review
      jest.spyOn(repository, 'remove').mockResolvedValueOnce(review);

      // Execute the remove method
      const removedReview = await service.remove(reviewId, housingId);

      // Assert the review was removed and returned
      expect(removedReview).toEqual(review);

      // Assert the service methods were called with the correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);
      expect(
        housingService.updateAggregateReviewAfterDelete,
      ).toHaveBeenCalledWith(review, housingId);
      expect(housingService.updateAvgReviewAfterDelete).toHaveBeenCalledWith(
        review.rating,
        housingId,
      );
      expect(repository.remove).toHaveBeenCalledWith(review);
    });

    it('should return null if review is not found', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';

      // Mock findOne method of ReviewsService to return null
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      // Call remove method of ReviewsService
      const removedReview = await service.remove(reviewId, housingId);

      // Assert that removedReview is null
      expect(removedReview).toBeNull();

      // Assert that findOne method of ReviewsService is called with correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);

      // Assert that remove method of reviewRepository is not called
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return reviews based on provided parameters', async () => {
      // Mock getMany method of query builder to return mock reviews
      const resultReviewArray: Review[] = [
        { ...review, content: 'Review A', ensureRatingNonNegative: jest.fn() },
        { ...review, content: 'Review B', ensureRatingNonNegative: jest.fn() },
        { ...review, content: 'Review C', ensureRatingNonNegative: jest.fn() },
      ];

      const limit = 10;
      const offset = 0;
      const housingId = '1';
      const search = 'Review';
      const withUserData = true;
      const queryBuilder = {
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(resultReviewArray),
      };

      repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      // Call findAll method of ReviewsService
      const foundReviews = await service.findAll(
        limit,
        offset,
        housingId,
        search,
        null,
        withUserData,
      );

      // Assert that the query builder is constructed correctly
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('review');

      expect(
        repository.createQueryBuilder('review').limit,
      ).toHaveBeenCalledWith(limit);
      expect(
        repository.createQueryBuilder('review').offset,
      ).toHaveBeenCalledWith(offset);
      expect(
        repository.createQueryBuilder('review').andWhere,
      ).toHaveBeenCalledWith('review.content ILIKE :search', {
        search: `%${search}%`,
      });

      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
        'review.housingId = :housingId',
        { housingId },
      );

      expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'review.timestamp',
        'DESC',
      );
      expect(
        repository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('review.user', 'user');

      // Assert that the reviews are retrieved correctly
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(foundReviews).toEqual(resultReviewArray);
    });
    it('should return reviews sorted by popularity when sortBy is "popularity"', async () => {
      const sortBy = 'popularity'; // Sort by popularity

      // Call findAll method of ReviewsService with sortBy parameter
      await service.findAll(10, 0, '1', 'Review', sortBy, true);

      // Assert that the reviewRepository.createQueryBuilder is called with correct parameters
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'review.upvoteCount',
        'DESC',
      );
    });

    it('should return reviews sorted by recency when sortBy is "recency"', async () => {
      const sortBy = 'recency'; // Sort by recency

      // Call findAll method of ReviewsService with sortBy parameter
      await service.findAll(10, 0, '1', 'Review', sortBy, true);

      // Assert that the reviewRepository.createQueryBuilder is called with correct parameters
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'review.timestamp',
        'DESC',
      );
    });

    it('should return reviews sorted by timestamp by default when sortBy is not provided', async () => {
      const sortBy = undefined; // No sortBy parameter provided

      // Call findAll method of ReviewsService without sortBy parameter
      await service.findAll(10, 0, '1', 'Review', sortBy, true);

      // Assert that the reviewRepository.createQueryBuilder is called with correct parameters
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'review.timestamp',
        'DESC',
      );
    });

    it('should return reviews sorted by timestamp by default when sortBy is not recognized', async () => {
      const invalidSortBy = 'invalid'; // An invalid sortBy parameter

      // Call findAll method of ReviewsService with an invalid sortBy parameter
      await service.findAll(10, 0, '1', 'Review', invalidSortBy, true);

      // Assert that the reviewRepository.createQueryBuilder is called with correct parameters
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'review.timestamp',
        'DESC',
      );
    });
  });

  describe('upvote', () => {
    it('should upvote a review', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';
      const userId = 1;

      const review: Review = {
        id: reviewId,
        content: 'Great place to stay!',
        timestamp: new Date(),
        rating: 4,
        upvoteCount: 0,
        user: mockUser,
        userId: 1,
        likedBy: [],
        housing: mockHousing,
        housingId: '1',
        ensureRatingNonNegative() {
          if (this.rating < 0) {
            this.rating = 0; // set rating to 0 if negative
          }
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(review);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(review);

      const upvotedReview = await service.upvote(reviewId, housingId, userId);

      expect(upvotedReview.upvoteCount).toEqual(1);
      expect(upvotedReview.likedBy).toContain(userId);
      expect(repository.save).toHaveBeenCalledWith(review);
    });

    it('should throw error if user has already upvoted the review', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';
      const userId = 1;

      const review: Review = {
        id: reviewId,
        content: 'Great place to stay!',
        timestamp: new Date(),
        rating: 4,
        upvoteCount: 1,
        user: mockUser,
        userId: 1,
        likedBy: [userId], // Assume user has already upvoted
        housing: mockHousing,
        housingId: '1',
        ensureRatingNonNegative() {
          if (this.rating < 0) {
            this.rating = 0; // set rating to 0 if negative
          }
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(review);

      await expect(service.upvote(reviewId, housingId, userId)).rejects.toThrow(
        'You have already upvoted this review',
      );

      // Assert that findOne method was called with correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);
      // Assert that save method was not called
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null if review is not found', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';
      const userId = 1;

      // Mock findOne method of ReviewsService to return null
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      // Call upvote method of ReviewsService
      const result = await service.upvote(reviewId, housingId, userId);

      // Assert that result is null
      expect(result).toBeNull();

      // Assert that findOne method of ReviewsService is called with correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);

      // Assert that save method was not called
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('upvoteUndo', () => {
    it('should undo upvote for a review', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';
      const userId = 1;

      const review: Review = {
        id: reviewId,
        content: 'Great place to stay!',
        timestamp: new Date(),
        rating: 4,
        upvoteCount: 1, // Assume review already has one upvote
        user: mockUser,
        userId: 1,
        likedBy: [userId], // Assume user has already upvoted
        housing: mockHousing,
        housingId: '1',
        ensureRatingNonNegative() {
          if (this.rating < 0) {
            this.rating = 0; // set rating to 0 if negative
          }
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(review);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(review);

      const upvoteUndoneReview = await service.upvoteUndo(
        reviewId,
        housingId,
        userId,
      );

      expect(upvoteUndoneReview.upvoteCount).toEqual(0);
      expect(upvoteUndoneReview.likedBy).not.toContain(userId);
      expect(repository.save).toHaveBeenCalledWith(review);
    });

    it('should throw error if user has not upvoted the review', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';
      const userId = 1;

      const review: Review = {
        id: reviewId,
        content: 'Great place to stay!',
        timestamp: new Date(),
        rating: 4,
        upvoteCount: 0,
        user: mockUser,
        userId: 1,
        likedBy: [], // Assume user has not upvoted
        housing: mockHousing,
        housingId: '1',
        ensureRatingNonNegative() {
          if (this.rating < 0) {
            this.rating = 0; // set rating to 0 if negative
          }
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(review);

      await expect(
        service.upvoteUndo(reviewId, housingId, userId),
      ).rejects.toThrow('You have not upvoted this review');

      // Assert that findOne method was called with correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);
      // Assert that save method was not called
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null if review is not found', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';
      const userId = 1;

      // Mock findOne method of ReviewsService to return null
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      // Call upvoteUndo method of ReviewsService
      const result = await service.upvoteUndo(reviewId, housingId, userId);

      // Assert that result is null
      expect(result).toBeNull();

      // Assert that findOne method of ReviewsService is called with correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);

      // Assert that save method was not called
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findLikedBy', () => {
    it('should return an array of user IDs who liked the review', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';

      const userIds: number[] = [1, 2, 3]; // Assume these are the user IDs who liked the review

      const review: Review = {
        id: reviewId,
        content: 'Great place to stay!',
        timestamp: new Date(),
        rating: 4,
        upvoteCount: 3, // Assume review has 3 upvotes
        user: mockUser,
        userId: 1,
        likedBy: userIds,
        housing: mockHousing,
        housingId: '1',
        ensureRatingNonNegative() {
          if (this.rating < 0) {
            this.rating = 0; // set rating to 0 if negative
          }
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(review);

      const likedByUserIds = await service.findLikedBy(reviewId, housingId);

      expect(likedByUserIds).toEqual(userIds);
    });

    it('should return null if review is not found', async () => {
      const reviewId = 'uuid-id';
      const housingId = '1';

      // Mock findOne method of ReviewsService to return null
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      // Call findLikedBy method of ReviewsService
      const result = await service.findLikedBy(reviewId, housingId);

      // Assert that result is null
      expect(result).toBeNull();

      // Assert that findOne method of ReviewsService is called with correct parameters
      expect(service.findOne).toHaveBeenCalledWith(reviewId, housingId);
    });
  });
});
