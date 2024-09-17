import { Module } from '@nestjs/common';
import { HousingController } from './housing.controller';
import { HousingService } from './housing.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Housing } from './housing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Housing])],
  controllers: [HousingController],
  providers: [HousingService]
})
export class HousingModule {}
