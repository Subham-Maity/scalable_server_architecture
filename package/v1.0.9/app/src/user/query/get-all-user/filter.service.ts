import { Prisma } from '@prisma/client';
import { GetAllUsersDto } from '../../dto';
import { LoggerService } from './logger';

export class FilterService {
  loggerService = new LoggerService();

  getFilterParams(dto: GetAllUsersDto) {
    const where: Prisma.UserWhereInput = {};

    //Destructure the query params and log them to the console.
    const { q, sortBy, order, page, limit, ...filters } = dto;

    this.loggerService.logQuery(q, 'Search');
    this.loggerService.logQuery(sortBy, 'Sort by');
    this.loggerService.logQuery(order, 'Order');
    this.loggerService.logQuery(page, 'Page');
    this.loggerService.logQuery(limit, 'Limit');
    this.loggerService.logQuery(filters, 'Filters');

    //Filter the users based on the query params. If a query param is undefined, it will be ignored.
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        where[key as keyof Prisma.UserWhereInput] = value as any;
      }
    });

    this.loggerService.logQuery(where, 'Where');

    //Return the where object with the filters applied.
    return { where };
  }
}
