import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger';
import { GetAllGeoDto } from '../../dto';

@Injectable()
export class FilterService {
  constructor(private loggerService: LoggerService) {}

  getFilterParams(dto: GetAllGeoDto): { where: Prisma.GeoLogWhereInput } {
    const where: Prisma.GeoLogWhereInput = {};

    const { id, userId, email, ipAddress, action, userAgent, createdAt, updatedAt } = dto;

    this.loggerService.logQuery(id, 'ID');
    this.loggerService.logQuery(userId, 'User ID');
    this.loggerService.logQuery(email, 'Email');
    this.loggerService.logQuery(ipAddress, 'IP Address');
    this.loggerService.logQuery(action, 'Action');
    this.loggerService.logQuery(userAgent, 'User Agent');
    this.loggerService.logQuery(createdAt, 'Created At');
    this.loggerService.logQuery(updatedAt, 'Updated At');

    if (id) {
      where.id = id;
    }

    if (userId) {
      where.userId = userId;
    }

    if (email) {
      where.email = email;
    }

    if (ipAddress) {
      where.ipAddress = ipAddress;
    }

    if (action) {
      where.action = action;
    }

    if (userAgent) {
      where.userAgent = userAgent;
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
