import { Module } from '@nestjs/common';
import { FavoriteHousingService } from './favorite-housing.service';
import { FavoriteHousingController } from './favorite-housing.controller';
import { favoriteHousing } from './favorite-housing.entity';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { HousingService } from 'src/housing/housing.service';
import { Housing } from 'src/housing/housing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([favoriteHousing, User, Housing])],
  providers: [FavoriteHousingService, UserService, HousingService],
  controllers: [FavoriteHousingController],
})
export class FavoriteHousingModule {}
