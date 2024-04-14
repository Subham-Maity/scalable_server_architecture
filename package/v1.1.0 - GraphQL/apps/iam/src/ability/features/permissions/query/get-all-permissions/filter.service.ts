import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger';
import { GetAllPermissionsDto } from '../../dto';

@Injectable()
export class FilterService {
  constructor(private readonly loggerService: LoggerService) {}

  getFilterParams(dto: GetAllPermissionsDto) {
    const where: Prisma.PermissionWhereInput = {};

    const { q, sortBy, order, page, limit, id, name, action, createdAt, updatedAt } = dto;

    this.loggerService.logQuery(q, 'Search');
    this.loggerService.logQuery(sortBy, 'Sort by');
    this.loggerService.logQuery(order, 'Order');
    this.loggerService.logQuery(page, 'Page');
    this.loggerService.logQuery(limit, 'Limit');
    this.loggerService.logQuery(id, 'ID');
    this.loggerService.logQuery(name, 'Name');
    this.loggerService.logQuery(action, 'Action');
    this.loggerService.logQuery(createdAt, 'CreatedAt');
    this.loggerService.logQuery(updatedAt, 'UpdatedAt');

    if (id) {
      where.id = id;
    }

    if (name) {
      where.name = name;
    }

    if (action) {
      where.action = action;
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
