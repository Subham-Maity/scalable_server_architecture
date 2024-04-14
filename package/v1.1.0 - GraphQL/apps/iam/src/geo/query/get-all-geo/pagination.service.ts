import { Injectable, BadRequestException } from '@nestjs/common';
import { GetAllGeoDto } from '../../dto';

@Injectable()
export class PaginationService {
  getPaginationParams(dto: GetAllGeoDto) {
    const page = dto.page ? parseInt(dto.page.toString(), 10) : 1;
    const limit = dto.limit ? parseInt(dto.limit.toString(), 10) : 10;

    if (isNaN(page) || page < 1) {
      throw new BadRequestException('Page must be a valid positive number');
    }

    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a valid positive number');
    }

    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }
}
