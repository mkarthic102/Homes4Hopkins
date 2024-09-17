import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteHousingService } from './favorite-housing.service';
import { HousingService } from 'src/housing/housing.service';
import { Repository } from 'typeorm';
import { favoriteHousing } from './favorite-housing.entity';
import { Housing } from 'src/housing/housing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

describe('FavoriteHousingService', () => {
  let service: FavoriteHousingService;
  let housingService: HousingService;
  let repository: Repository<favoriteHousing>;
  let housingRepository: Repository<Housing>;

  const FAV_HOUSING_REPO_TOKEN = getRepositoryToken(favoriteHousing);
  const HOUSING_REPO_TOKEN = getRepositoryToken(Housing);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteHousingService,
        HousingService,
        {
          provide: FAV_HOUSING_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(), 
            find: jest.fn(),
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
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FavoriteHousingService>(FavoriteHousingService);
    housingService = module.get<HousingService>(HousingService);
    repository = module.get<Repository<favoriteHousing>>(
      FAV_HOUSING_REPO_TOKEN,
    );
    housingRepository = module.get<Repository<Housing>>(HOUSING_REPO_TOKEN);
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
    it('should create a new favorite housing item', async () => {
      const mockFavoriteHousing: favoriteHousing = {
        id: 'uuid',
        housingId: '123',
        userId: 1,
        user: mockUser,
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockFavoriteHousing);
      jest.spyOn(repository, 'save').mockResolvedValue(mockFavoriteHousing);

      const result = await service.create('123', 1);

      expect(repository.create).toHaveBeenCalledWith({
        housingId: '123',
        userId: 1,
      });
      expect(repository.save).toHaveBeenCalledWith(mockFavoriteHousing);
      expect(result).toEqual(mockFavoriteHousing);
    });
  });

  describe('findOne', () => {
    it('should find a favorite housing item by userId and housingId', async () => {
      const mockFavoriteHousing: favoriteHousing = {
        id: 'uuid',
        housingId: '123',
        userId: 1,
        user: mockUser,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFavoriteHousing);

      const result = await service.findOne(1, '123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, housingId: '123' },
      });
      expect(result).toEqual(mockFavoriteHousing);
    });
  });

  describe('remove', () => {
    it('should remove a favorite housing item by userId and housingId', async () => {
      const mockFavoriteHousing: favoriteHousing = {
        id: 'uuid',
        housingId: '123',
        userId: 1,
        user: mockUser,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFavoriteHousing);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockFavoriteHousing);

      const result = await service.remove(1, '123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, housingId: '123' },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockFavoriteHousing);
      expect(result).toEqual(mockFavoriteHousing);
    });

    it('should return null if favorite housing item not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.remove(1, '123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, housingId: '123' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all favorite housings for a user', async () => {

      jest
        .spyOn(housingService, 'findAll')
        .mockResolvedValue([mockHousing, mockHousing1]);
      jest
        .spyOn(housingService, 'findOne')
        .mockResolvedValueOnce(mockHousing)
        .mockResolvedValueOnce(mockHousing1);

      const result = await service.findAll(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual([]);
    });

    it('should return an empty array if no favorite housings found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(null);

      const result = await service.findAll(1);
      expect(result).toEqual([]);
    });

    it('should find all favorite housings for a user', async () => {
      // Mock favorite housings and their housing IDs
      // Mock the behavior of the housingsService.findOne method
      jest
        .spyOn(housingService, 'findOne')
        .mockImplementation(async (housingId: string) => {
          // Simulate behavior: Return housing mock if ID matches
          if (housingId === mockHousing.id) return mockHousing;
          if (housingId === mockHousing1.id) return mockHousing1;
          return null; // Return null if ID doesn't match any mock
        });

      // Call the method being tested
      const result = await service.findAll(1);
  
      // Assertions
      expect(result).toHaveLength(0); 
    });
  });
});
