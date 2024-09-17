import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteHousingController } from './favorite-housing.controller';
import { FavoriteHousingService } from './favorite-housing.service';
import { FavoriteHousingModule } from './favorite-housing.module';
import { HousingService } from 'src/housing/housing.service';
import { Repository } from 'typeorm';
import { favoriteHousing } from './favorite-housing.entity';
import { Housing } from 'src/housing/housing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, RouteParamMetadata } from '@nestjs/common';
import { favoriteHousingResponseDto } from './favoriteHousing-response.dto';
import { User } from 'src/user/user.entity';
import { off } from 'process';

describe('FavoriteHousingController', () => {
  let controller: FavoriteHousingController;
  let favoriteHousingService: FavoriteHousingService;
  let housingService: HousingService;
  let repository: Repository<favoriteHousing>;
  let housingRepository: Repository<Housing>;

  const FAV_HOUSING_REPO_TOKEN = getRepositoryToken(favoriteHousing);
  const HOUSING_REPO_TOKEN = getRepositoryToken(Housing);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteHousingController],
      providers: [
        FavoriteHousingService,
        HousingService,
        {
          provide: FAV_HOUSING_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HOUSING_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FavoriteHousingController>(
      FavoriteHousingController,
    );
    favoriteHousingService = module.get<FavoriteHousingService>(
      FavoriteHousingService,
    );
    housingService = module.get<HousingService>(HousingService);
    repository = module.get<Repository<favoriteHousing>>(
      FAV_HOUSING_REPO_TOKEN,
    );
    housingRepository = module.get<Repository<Housing>>(HOUSING_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  const mockHousing1: Housing = {
    id: '2',
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

  describe('create', () => {
    it('should create a favorite housing item and return it', async () => {
      // Mock data
      const housingId = '1';
      const userId = 1;
      const mockUser = new User(); // Create a mock user instance
      mockUser.id = userId;

      const mockFavoriteHousing: favoriteHousing = {
        id: 'uuid-id',
        housingId: '1',
        userId: mockUser.id,
        user: mockUser, // Assign the mock user to the user property
      };

      jest
        .spyOn(favoriteHousingService, 'create')
        .mockResolvedValue(mockFavoriteHousing);

      const result = await controller.create(housingId, userId);

      expect(result).toEqual({
        id: 'uuid-id',
        housingId: '1',
        user: {
          id: 1,
        },
      });

      expect(favoriteHousingService.create).toHaveBeenCalledWith(
        housingId,
        userId,
      );
    });
  });

  describe('findOne', () => {
    it('should find a favorite housing item by housingId', async () => {
      const userId = 1;
      const housingId = '1';
      const mockFavoriteHousing: favoriteHousing = {
        id: 'uuid-id',
        housingId,
        userId,
        user: mockUser,
      };

      jest
        .spyOn(favoriteHousingService, 'findOne')
        .mockResolvedValue(mockFavoriteHousing);

      const result = await controller.findOne(userId, housingId);

      expect(result).toEqual({ id: 'uuid-id' });
      expect(favoriteHousingService.findOne).toHaveBeenCalledWith(
        userId,
        housingId,
      );
    });

    it('should return null if no favorite housing item is found', async () => {
      const userId = 1;
      const housingId = '1';

      jest.spyOn(favoriteHousingService, 'findOne').mockResolvedValue(null);

      const result = await controller.findOne(userId, housingId);

      expect(result).toEqual({ id: null });
      expect(favoriteHousingService.findOne).toHaveBeenCalledWith(
        userId,
        housingId,
      );
    });
  });

  describe('remove', () => {
    it('should remove a favorite housing item', async () => {
      const userId = 1;
      const housingId = '1';
      const mockFavoriteHousing: favoriteHousing = {
        id: 'uuid-id',
        housingId,
        userId,
        user: mockUser,
      };

      jest
        .spyOn(favoriteHousingService, 'remove')
        .mockResolvedValue(mockFavoriteHousing);

      const result = await controller.remove(userId, housingId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'favoriteHousing deleted successfully',
      });
      expect(favoriteHousingService.remove).toHaveBeenCalledWith(
        userId,
        housingId,
      );
    });

    it('should throw NotFoundException if no favorite housing item is found', async () => {
      const userId = 1;
      const housingId = '1';

      jest.spyOn(favoriteHousingService, 'remove').mockResolvedValue(null);

      await expect(controller.remove(userId, housingId)).rejects.toThrow(
        NotFoundException,
      );
      expect(favoriteHousingService.remove).toHaveBeenCalledWith(
        userId,
        housingId,
      );
    });
  });

  describe('findAll', () => {
    it('should find all favorite housing items for a user', async () => {
      const userId = 1;

      jest
        .spyOn(favoriteHousingService, 'findAll')
        .mockResolvedValue([mockHousing, mockHousing1]);

      const result = await controller.findAll(userId);

      expect(result).toEqual([mockHousing, mockHousing1]);
      expect(favoriteHousingService.findAll).toHaveBeenCalledWith(userId);
    });
  });
});
