import { Test, TestingModule } from '@nestjs/testing';
import { HousingService } from './housing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Housing } from './housing.entity';
import { Repository } from 'typeorm';
import { CreateHousingDTO } from './create-housing.dto';
import { UpdateHousingDTO } from './update-housing.dto';

describe('HousingService', () => {
  let service: HousingService;
  let housingRepository: Repository<Housing>;

  const HOUSING_REPO_TOKEN = getRepositoryToken(Housing);
  const id = 'uuid-id';
  const resultHousing: Housing = {
    id: 'uuid-id', // Mocked UUID 
    name: 'Sample Housing',
    address: '123 Main St',
    latitude: 0,
    longitude: 0,
    imageURL: 'http://example.com/image.jpg', // nullable
    price: '1000$', // default value is '$', but typically this would be set to a specific price
    distance: 10.0, // decimal value with precision 6 and scale 1
    avgRating: null, // default value is null, represents calculated field
    reviewCount: 0, // default value is 0, represents calculated field
    reviews: [],
    aggregateReview: null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HousingService, 
        {
          provide: HOUSING_REPO_TOKEN,
          useValue: {
            create:  jest.fn(),
            remove:  jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<HousingService>(HousingService);
    housingRepository = module.get<Repository<Housing>>(HOUSING_REPO_TOKEN)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('HousingRepository should be defined', () => {
    expect(housingRepository).toBeDefined();
  });

  describe('create a housing entity', () => {
    //arrange
    const createHousingDto: CreateHousingDTO = {
      name: 'Sample Housing',
      address: '123 Main St',
      latitude: 0,
      longitude: 0,
      imageURL: 'http://example.com/image.jpg', // optional
      distance: 10, // optional, positive number
      price: '1000$', // optional
    };
    it('should successfully create a housing entry', async () => {
      jest.spyOn(housingRepository, 'create').mockReturnValue(resultHousing);
      jest.spyOn(housingRepository, 'save').mockResolvedValue(resultHousing);

      const result = await service.create(createHousingDto);

      expect(housingRepository.create).toHaveBeenCalledWith(createHousingDto);
      expect(housingRepository.save).toHaveBeenCalledWith(resultHousing);
      expect(result).toEqual(resultHousing);
    });

    // Add more test cases if necessary, e.g., handling of exceptions
  });

  describe('findAll', () => {
    //Mock Array of Housing itms
    const resultHousingArray: Housing[] = [
      { ...resultHousing, name: 'Sample Housing A' },
      { ...resultHousing, name: 'Sample Housing B' },
      { ...resultHousing, name: 'Sample Housing C' },
    ];
    const limit = 10;
    const offset = 0;
    const queryBuilder = {
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(resultHousingArray),
    };

    it('should return an array of housings', async () => {
      const search = undefined;

      housingRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.findAll(limit, offset, search);

      expect(housingRepository.createQueryBuilder).toHaveBeenCalledWith('housings');
      expect(queryBuilder.limit).toHaveBeenCalledWith(limit);
      expect(queryBuilder.offset).toHaveBeenCalledWith(offset);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('housings.name', 'ASC');
      if (search !== undefined) {
        expect(queryBuilder.where).toHaveBeenCalledWith('housings.name ILIKE :search', {
          search: `%${search}%`,
        });
      }
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(resultHousingArray);
    });

    it('should return filtered housings when search term is', async () => {
      const mockFilteredResponse = [{ ...resultHousing, name: 'Sample Housing B' }];
      const limit = 10;
      const offset = 0;
      const search = 'B';
  
      const queryBuilder = {
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockFilteredResponse),
      };
  
      housingRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
  
      const result = await service.findAll(limit, offset, search);
  
      expect(housingRepository.createQueryBuilder).toHaveBeenCalledWith('housings');
      expect(queryBuilder.limit).toHaveBeenCalledWith(limit);
      expect(queryBuilder.offset).toHaveBeenCalledWith(offset);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('housings.name', 'ASC');
      expect(queryBuilder.where).toHaveBeenCalledWith('housings.name ILIKE :search', {
        search: `%${search}%`,
      });
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockFilteredResponse);
    });
  
    // Additional test cases if necessary
  });


  describe('update', () => {
    const updateHousingDto: UpdateHousingDTO =  {
      name: 'Sample Housing',
      address: '123 Main St',
      imageURL: 'http://example.com/image.jpg', // optional
    };
    const updatedHousing = { id, ...updateHousingDto };

    it('should update and return a housing entity', async () => {
      housingRepository.preload = jest.fn().mockResolvedValue(updatedHousing);
      housingRepository.save = jest.fn().mockResolvedValue(updatedHousing);

      const result = await service.update(id, updateHousingDto);

      expect(housingRepository.preload).toHaveBeenCalledWith({ id, ...updateHousingDto });
      expect(housingRepository.save).toHaveBeenCalledWith(updatedHousing);
      expect(result).toEqual(updatedHousing);
    });

    it('should return null if no housing entity is found', async () => {
      housingRepository.preload = jest.fn().mockResolvedValue(null);

      const result = await service.update(id, updateHousingDto);

      expect(housingRepository.preload).toHaveBeenCalledWith({ id, ...updateHousingDto });
      expect(result).toBeNull();
    });

    // Additional test cases if necessary
  });

  describe('remove', () => {
    it('should remove and return a housing entity', async () => {
      // Mock for createQueryBuilder and its chain methods
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(resultHousing),
      };
    
      housingRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      housingRepository.remove = jest.fn().mockResolvedValue(resultHousing);
    
      const result = await service.remove(id);
    
      expect(housingRepository.createQueryBuilder).toHaveBeenCalledWith('housing');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('housing.reviews', 'reviews');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('housing.id = :id', { id });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(housingRepository.remove).toHaveBeenCalledWith(resultHousing);
      expect(result).toEqual(resultHousing);
    });
  
    it('should return null if no housing entity is found', async () => {
      // Mock for createQueryBuilder and its chain methods
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // Mocked to return null
      };
    
      housingRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
    
      const result = await service.remove(id);
    
      expect(housingRepository.createQueryBuilder).toHaveBeenCalledWith('housing');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('housing.reviews', 'reviews');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('housing.id = :id', { id });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toBeNull();
    });
    
  
    // Additional test cases if necessary
  });

  describe('updateAvgReviewAfterCreate', () => {
    const newRating = 4.5;
    const id = 'uuid-id';

    it('should update average review after creating a review', async () => {
      const housing = { ...resultHousing, avgRating: 3.5, reviewCount: 5 };
      jest.spyOn(service, 'findOne').mockResolvedValue(housing);
      jest.spyOn(housingRepository, 'save').mockResolvedValue(housing);

      const result = await service.updateAvgReviewAfterCreate(newRating, id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(housing.avgRating).toBe((3.5 * 5 + newRating) / 6);
      expect(housing.reviewCount).toBe(6);
      expect(housingRepository.save).toHaveBeenCalledWith(housing);
      expect(result).toEqual(housing);
    });

    it('should return null if housing entity is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const result = await service.updateAvgReviewAfterCreate(newRating, id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('updateAvgReviewAfterDelete', () => {
    const deletedRating = 2.5;
    const id = 'uuid-id';

    it('should update average review after deleting a review', async () => {
      const housing = { ...resultHousing, avgRating: 3.5, reviewCount: 5 };
      jest.spyOn(service, 'findOne').mockResolvedValue(housing);
      jest.spyOn(housingRepository, 'save').mockResolvedValue(housing);

      const result = await service.updateAvgReviewAfterDelete(
        deletedRating,
        id,
      );

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(housing.avgRating).toBe((3.5 * 5 - deletedRating) / 4);
      expect(housing.reviewCount).toBe(4);
      expect(housingRepository.save).toHaveBeenCalledWith(housing);
      expect(result).toEqual(housing);
    });

    it('should set average review to 0 if there are no reviews after deleting', async () => {
      const housing = { ...resultHousing, avgRating: 3.5, reviewCount: 1 };
      jest.spyOn(service, 'findOne').mockResolvedValue(housing);
      jest.spyOn(housingRepository, 'save').mockResolvedValue(housing);

      const result = await service.updateAvgReviewAfterDelete(
        deletedRating,
        id,
      );

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(housing.avgRating).toBe(0);
      expect(housing.reviewCount).toBe(0);
      expect(housingRepository.save).toHaveBeenCalledWith(housing);
      expect(result).toEqual(housing);
    });

    it('should return null if housing entity is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const result = await service.updateAvgReviewAfterDelete(
        deletedRating,
        id,
      );

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });
  

});
