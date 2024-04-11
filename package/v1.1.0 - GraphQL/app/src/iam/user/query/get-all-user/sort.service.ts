import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetAllUsersDto } from '../../dto';

export class SortService {
  //Declared variables for valid sort fields and order
  validSortFields = ['email', 'firstName', 'lastName', 'createdAt', 'updatedAt'];

  getSortParams(dto: GetAllUsersDto) {
    //Get all sort fields
    const { sortBy, order } = dto;

    //Check if sortBy and order are valid and throw an error if not.
    if (sortBy && !this.validSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    //Check if sortBy and order are valid and throw an error if not.
    if (order && !['asc', 'desc'].includes(order)) {
      throw new BadRequestException(`Invalid order: ${order}`);
    }

    //Create an object with the sortBy and order fields if they are valid. Otherwise, create an empty object.
    const orderBy: Prisma.UserOrderByWithRelationInput = {};

    //Add the sortBy and order fields to the orderBy object if they are valid. Otherwise, add an empty object.
    if (sortBy) {
      orderBy[sortBy as keyof Prisma.UserOrderByWithRelationInput] = order || 'asc';
    }

    return { orderBy };
  }
}
