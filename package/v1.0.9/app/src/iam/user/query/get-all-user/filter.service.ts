import { Prisma } from '@prisma/client';
import { GetAllUsersDto } from '../../dto';
import { LoggerService } from './logger';

export class FilterService {
  loggerService = new LoggerService();

  getFilterParams(dto: GetAllUsersDto) {
    const where: Prisma.UserWhereInput = {};

    const {
      q,
      sortBy,
      order,
      page,
      limit,
      id,
      email,
      firstName,
      lastName,
      deleted,
      roleId,
      createdAt,
      updatedAt,
    } = dto;

    this.loggerService.logQuery(q, 'Search');
    this.loggerService.logQuery(sortBy, 'Sort by');
    this.loggerService.logQuery(order, 'Order');
    this.loggerService.logQuery(page, 'Page');
    this.loggerService.logQuery(limit, 'Limit');
    this.loggerService.logQuery(id, 'ID');
    this.loggerService.logQuery(email, 'Email');
    this.loggerService.logQuery(firstName, 'FirstName');
    this.loggerService.logQuery(lastName, 'LastName');
    this.loggerService.logQuery(deleted, 'Deleted');
    this.loggerService.logQuery(roleId, 'RoleId');
    this.loggerService.logQuery(createdAt, 'CreatedAt');
    this.loggerService.logQuery(updatedAt, 'UpdatedAt');

    if (id) {
      where.id = id;
    }

    if (email) {
      where.email = email;
    }

    if (firstName) {
      where.firstName = firstName;
    }

    if (lastName) {
      where.lastName = lastName;
    }

    if (deleted !== undefined) {
      where.deleted = deleted;
    }

    if (roleId) {
      where.roleId = roleId;
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
