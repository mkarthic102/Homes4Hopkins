import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoriteHousingService } from './favorite-housing.service';
import { HousingExistsGuard } from 'src/guards/housing-exists.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { favoriteHousingResponseDto } from './favoriteHousing-response.dto';
import { favoriteHousing } from './favorite-housing.entity';
import { Housing } from 'src/housing/housing.entity';

@Controller('users/:userId/favoriteHousings')
export class FavoriteHousingController {
  constructor(
    private readonly favoriteHousingService: FavoriteHousingService,
  ) {}

  @UseGuards(HousingExistsGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':housingId')
  async create(
    @Param('housingId') housingId: string,
    @UserId() userId: number,
  ): Promise<favoriteHousingResponseDto> {
    const favorite_housing = await this.favoriteHousingService.create(
      housingId,
      userId,
    );
    delete favorite_housing.userId;
    return favorite_housing;
  }
 
  // Finds whether a given user has liked a given housing item
  // returns null if not
  @UseGuards(HousingExistsGuard)
  @Get(':housingId')
  async findOne(
    @Param('userId') userId: number,
    @Param('housingId') housingId: string,
  ): Promise<favoriteHousingResponseDto> {
    const favorite_housing = await this.favoriteHousingService.findOne(
      userId,
      housingId,
    );
    if (!favorite_housing) {
      return { id: null };
    }
    return {
      id: favorite_housing.id,
    }
  }

  @UseGuards(HousingExistsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':housingId')
  async remove(
    @Param('userId') userId: number,
    @Param('housingId') housingId: string,
  ): Promise<{ statusCode: number; message: string }> {
    const favorite_housing = await this.favoriteHousingService.remove(
      userId,
      housingId,
    );
    if (!favorite_housing) {
      throw new NotFoundException(
        `User with ID ${userId} not found in favorites list of housing item with ID ${housingId}`,
      );
    }

    return {
      statusCode: 200,
      message: 'favoriteHousing deleted successfully',
    };
  }

  // Find all housings liked by a user
  @Get()
  async findAll(@Param('userId') userId: number): Promise<Housing[] | null> {
    const favorite_housings = await this.favoriteHousingService.findAll(userId);
    return favorite_housings;
  }
}
