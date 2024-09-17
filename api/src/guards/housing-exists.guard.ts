import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HousingService } from 'src/housing/housing.service';

@Injectable()
export class HousingExistsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private housingsService: HousingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const housingId = request.params.housingId;

    if (!housingId) {
      throw new BadRequestException('Invalid or missing housing ID');
      return false;
    }

    const housing = await this.housingsService.findOne(housingId);

    if (!housing) {
      throw new NotFoundException(`Housing with ID ${housingId} not found`);
      return false;
    }
    return true;
  }
}
