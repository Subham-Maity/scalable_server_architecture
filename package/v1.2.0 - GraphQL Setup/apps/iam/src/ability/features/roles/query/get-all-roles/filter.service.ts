// filter.service.ts
import { Prisma } from '@prisma/client';
import { GetAllRolesDto } from '../../dto';
import { LoggerService } from './logger';

export class FilterService {
  loggerService = new LoggerService();

  getFilterParams(dto: GetAllRolesDto) {
    const where: Prisma.RoleWhereInput = {};

    const { q, sortBy, order, page, limit, name, description, createdAt, updatedAt } = dto;

    this.loggerService.logQuery(q, 'Search');
    this.loggerService.logQuery(sortBy, 'Sort by');
    this.loggerService.logQuery(order, 'Order');
    this.loggerService.logQuery(page, 'Page');
    this.loggerService.logQuery(limit, 'Limit');
    this.loggerService.logQuery(name, 'Name');
    this.loggerService.logQuery(description, 'Description');
    this.loggerService.logQuery(createdAt, 'CreatedAt');
    this.loggerService.logQuery(updatedAt, 'UpdatedAt');

    /**
    //This is not strict syntax
    if (name) {
      where.name = { contains: name };
    }
    */
    //This is a strict syntax
    if (name) {
      where.name = name;
    }
    if (description) {
      where.description = description;
    }

    if (createdAt) {
      where.createdAt = { equals: new Date(createdAt) };
    }

    if (updatedAt) {
      where.updatedAt = { equals: new Date(updatedAt) };
    }

    this.loggerService.logQuery(where, 'Where');

    return { where };
  }
}
