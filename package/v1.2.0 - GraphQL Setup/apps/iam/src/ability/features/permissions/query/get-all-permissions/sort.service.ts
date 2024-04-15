import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetAllPermissionsDto } from '../../dto';

export class SortService {
  validSortFields = ['name', 'action', 'createdAt', 'updatedAt'];

  getSortParams(dto: GetAllPermissionsDto) {
    const { sortBy, order } = dto;

    if (sortBy && !this.validSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    if (order && !['asc', 'desc'].includes(order)) {
      throw new BadRequestException(`Invalid order: ${order}`);
    }

    const orderBy: Prisma.PermissionOrderByWithRelationInput = {};

    if (sortBy) {
      orderBy[sortBy as keyof Prisma.PermissionOrderByWithRelationInput] =
        order || 'asc';
    }

    return { orderBy };
  }
}
