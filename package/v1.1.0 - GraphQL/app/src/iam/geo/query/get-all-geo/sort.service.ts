import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetAllGeoDto } from '../../dto';

@Injectable()
export class SortService {
  validSortFields = ['email', 'ipAddress', 'action', 'userAgent', 'createdAt', 'updatedAt'];

  getSortParams(dto: GetAllGeoDto): { orderBy: Prisma.GeoLogOrderByWithRelationInput } {
    const { sortBy, order } = dto;

    if (sortBy && !this.validSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    if (order && !['asc', 'desc'].includes(order)) {
      throw new BadRequestException(`Invalid order: ${order}`);
    }

    const orderBy: Prisma.GeoLogOrderByWithRelationInput = {};

    if (sortBy) {
      orderBy[sortBy as keyof Prisma.GeoLogOrderByWithRelationInput] = order || 'asc';
    }

    return { orderBy };
  }
}
