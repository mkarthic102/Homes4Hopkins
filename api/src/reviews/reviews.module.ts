import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { HousingService } from 'src/housing/housing.service';
import { Housing } from 'src/housing/housing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Housing])],
  providers: [ReviewsService, HousingService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
