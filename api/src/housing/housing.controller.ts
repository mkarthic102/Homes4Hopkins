import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HousingService } from './housing.service';
import { FindHousingsQueryDTO } from './find-housings-query.dto';
import { FindHousingsResponseDTO } from './find-housings-reponse.dto';
import { HousingResponseDTO } from './housing-reponse.dto';
import { CreateHousingDTO } from './create-housing.dto';
import { UpdateHousingDTO } from './update-housing.dto';

@Controller('housings')
export class HousingController {
  constructor(private readonly housingService: HousingService) {}

  /**
   * ADMIN ONLY
   * Create a new housing item
   * @param { CreateHousingDTO } createHousingDTO - parsed from request Body
   * @returns { HousingResponseDTO }
   */
  @Post()
  async create(
    @Body() createHousingDTO: CreateHousingDTO,
  ): Promise<HousingResponseDTO> {
    return this.housingService.create(createHousingDTO);
  }

  /**
   * Get multiple housing items based on query parameters
   * @param { FindHousingsQueryDTO } query - parsed from request Query parameters
   * @returns { FindHousingsResponseDTO }
   */
  @Get()
  async findAll(
    @Query() query: FindHousingsQueryDTO,
  ): Promise<FindHousingsResponseDTO> {
    const { limit, offset, search, maxDistance, price } = query;

    const housings = await this.housingService.findAll(
      limit,
      offset,
      search,
      maxDistance,
      price,
    );

    return {
      limit,
      offset,
      search,
      maxDistance,
      price,
      data: housings.map((housing) => housing as HousingResponseDTO),
    };
  }

  /**
   * Get one housing item by Id
   * @param { string } id - uuid of housing
   * @returns { HousingResponseDTO }
   *
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HousingResponseDTO> {
    const housing = await this.housingService.findOne(id);

    if (!housing) {
      throw new NotFoundException();
    }

    return housing;
  }

  /**
   * ADMIN ONLY
   * Change details of a housing item by Id
   * @param { string } id - uuid of housing
   * @param { UpdateHousingDTO } updateHousingDto - parsed from request Body
   * @returns { HousingResponseDTO }
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHousingDto: UpdateHousingDTO,
  ): Promise<HousingResponseDTO> {
    const housing = await this.housingService.update(id, updateHousingDto);
    if (!housing) {
      throw new NotFoundException();
    }
    return housing;
  }

  /**
   * ADMIN ONLY
   * Delete a housing item by Id
   * @param { string } id - uuid
   * @returns {
   *    statusCode: number,
   *    message: string,
   * }
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; message: string }> {
    const housing = await this.housingService.remove(id);
    if (!housing) {
      throw new NotFoundException();
    }
    return {
      statusCode: 200,
      message: 'Housing deleted successfully',
    };
  }
}
