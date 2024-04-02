import { Injectable, BadRequestException } from '@nestjs/common';
import { GetAllUsersDto } from '../../dto';

@Injectable()
export class PaginationService {
  getPaginationParams(dto: GetAllUsersDto) {
    //page and limit are optional, default values are 1 and 10 respectively.
    const page = dto.page ? parseInt(dto.page.toString(), 10) : 1;
    const limit = dto.limit ? parseInt(dto.limit.toString(), 10) : 10;

    //Check if page and limit are valid numbers. If not, throw an error.
    if (isNaN(page) || page < 1) {
      throw new BadRequestException('Page must be a valid positive number');
    }

    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a valid positive number');
    }
    // Skip and take are used to paginate the results.
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }
}
