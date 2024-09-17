import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { favoriteHousing } from './favorite-housing.entity';
import { Repository } from 'typeorm';
import { Housing } from 'src/housing/housing.entity';
import { HousingService } from 'src/housing/housing.service';

@Injectable()
export class FavoriteHousingService {
  constructor(
    @InjectRepository(favoriteHousing)
    private favoriteHousingRepository: Repository<favoriteHousing>,
    private housingsService: HousingService,
  ) {}

  async create(
    housingId: string,
    userId: number,
  ): Promise<favoriteHousing | null> {
    const favorite_housing = await this.favoriteHousingRepository.create({
      housingId,
      userId,
    });

    return this.favoriteHousingRepository.save(favorite_housing);
  }

  async findOne(
    userId: number,
    housingId: string,
  ): Promise<favoriteHousing | null> {
    const favorite_housing = await this.favoriteHousingRepository.findOne({
      where: {
        userId,
        housingId,
      },
    });
    return favorite_housing;
  }

  async remove(
    userId: number,
    housingId: string,
  ): Promise<favoriteHousing | null> {
    const favorite_housing = await this.findOne(userId, housingId);
    if (!favorite_housing) {
      return null;
    }
    return this.favoriteHousingRepository.remove(favorite_housing);
  }

  async findAll(userId: number): Promise<Housing[] | null> {
    // Retrieve favorite housings for the specified userId
    const favoriteHousings = await this.favoriteHousingRepository.find({
      where: { userId },
    });

    // If no favorite housings are found, return empty array
    if (!favoriteHousings) {
      return [];
    }

    // Extract housing IDs from favorite housings
    const housingIds = favoriteHousings.map((fh) => fh.housingId);

    // Use HousingsService to find all housings with matching IDs
    const housings: Housing[] = [];
    for (const housingId of housingIds) {
      const housing = await this.housingsService.findOne(housingId);
      if (housing) {
        housings.push(housing);
      }
    }
    return housings;
  }
}
