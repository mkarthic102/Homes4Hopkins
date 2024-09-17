import { Test, TestingModule } from '@nestjs/testing';
import { HousingController } from './housing.controller';
import { HousingService } from './housing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Housing } from './housing.entity';
import { Repository } from 'typeorm';
import { HousingResponseDTO } from './housing-reponse.dto';
import { UpdateHousingDTO } from './update-housing.dto';
import { CreateHousingDTO } from './create-housing.dto';
import { FindHousingsResponseDTO } from './find-housings-reponse.dto';

describe('HousingController', () => {
  let controller: HousingController;
  let service: HousingService;
  let housingRepository: Repository<Housing>;

  const HOUSING_REPO_TOKEN = getRepositoryToken(Housing);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HousingController],
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

    controller = module.get<HousingController>(HousingController);
    service = module.get<HousingService>(HousingService);
    housingRepository = module.get<Repository<Housing>>(HOUSING_REPO_TOKEN)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('housingService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('HousingRepository should be defined', () => {
    expect(housingRepository).toBeDefined();
  });

  // Test for create
  it('should create a new housing item', async () => {
    const createHousingDTO = new CreateHousingDTO();
    const result = new Housing(); // mock result
    const newuse = new FindHousingsResponseDTO;
    expect(newuse instanceof FindHousingsResponseDTO).toBe(true);

    jest.spyOn(service, 'create').mockResolvedValue(result);

    expect(await controller.create(createHousingDTO)).toBe(result);
    expect(service.create).toHaveBeenCalledWith(createHousingDTO);
  });

  // Test for findAll
  it('should return an array of housing items', async () => {
    const result = []; // mock array of housing items
    jest.spyOn(service, 'findAll').mockResolvedValue(result);
    const newuse = new HousingResponseDTO;
    expect(newuse instanceof HousingResponseDTO).toBe(true);

    expect(await controller.findAll({ limit: 10, offset: 0, search: '' })).toEqual({ limit: 10, offset: 0, search: '', data: result });
    expect(service.findAll).toHaveBeenCalledWith(10, 0, '', undefined, undefined);
  });

  // Test for findOne
  it('should return a single housing item', async () => {
    const id = 'uuid';
    const result = new Housing(); // mock housing item

    jest.spyOn(service, 'findOne').mockResolvedValue(result);

    expect(await controller.findOne(id)).toBe(result);
    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  // Test for update
  it('should update a housing item', async () => {
    const id = 'uuid';
    const updateHousingDTO = new UpdateHousingDTO();
    const result = new Housing(); // mock updated housing item

    jest.spyOn(service, 'update').mockResolvedValue(result);

    expect(await controller.update(id, updateHousingDTO)).toBe(result);
    expect(service.update).toHaveBeenCalledWith(id, updateHousingDTO);
  });

  // Test for remove
  it('should delete a housing item', async () => {
    const id = 'uuid';
    const result = { statusCode: 200, message: 'Housing deleted successfully' };
    const resultHousing = new Housing(); // mock updated housing item

    jest.spyOn(service, 'remove').mockResolvedValue(resultHousing);

    expect(await controller.remove(id)).toStrictEqual(result);
    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
