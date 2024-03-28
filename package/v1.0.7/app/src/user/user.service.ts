import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EditUserDto } from './dto';
import { ConfigId } from '../types';
import { asyncErrorHandler } from '../errors';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';
import { GetAllUsersParams } from './types';

@Injectable()
export class UserService {
  editUser = asyncErrorHandler(async (userId: ConfigId, dto: EditUserDto) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
    delete updatedUser.hash;

    delete updatedUser.refreshTokenHash;

    return updatedUser;
  });

  getUserById = asyncErrorHandler(async (email: string) => {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.refreshTokenHash;
    delete user.hash;
    return user;
  });

  // Pagination
  getPaginationParams = (params: GetAllUsersParams) => {
    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ? Number(params.limit) : 10;

    if (isNaN(page) || isNaN(limit)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }

    const skip = (page - 1) * limit;
    return { skip, take: limit };
  };

  // Sorting
  getSortParams = (params: GetAllUsersParams) => {
    const { sortBy, order } = params;
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy as keyof Prisma.UserOrderByWithRelationInput] = order || 'asc';
    }

    return { orderBy };
  };

  // Searching
  getSearchParams = (params: GetAllUsersParams) => {
    const { q } = params;
    const where: Prisma.UserWhereInput = {};

    if (q) {
      where.OR = [
        { email: { contains: q } },
        { firstName: { contains: q } },
        { lastName: { contains: q } },
      ];
    }

    return { where };
  };

  // Filtering
  getFilterParams = (params: GetAllUsersParams) => {
    const where: Prisma.UserWhereInput = {};

    Object.entries(params).forEach(([key, value]) => {
      if (
        key !== 'q' &&
        key !== 'sortBy' &&
        key !== 'order' &&
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined
      ) {
        where[key as keyof Prisma.UserWhereInput] = value as any;
      }
    });

    return { where };
  };

  getAllUsers = asyncErrorHandler(async (params: GetAllUsersParams) => {
    const { skip, take } = this.getPaginationParams(params);
    const { orderBy } = this.getSortParams(params);
    const { where: searchWhere } = this.getSearchParams(params);
    const { where: filterWhere } = this.getFilterParams(params);

    const users = await this.prisma.user.findMany({
      skip,
      take,
      orderBy,
      where: { ...searchWhere, ...filterWhere },
    });

    if (!users) {
      throw new NotFoundException('No users found');
    }

    users.forEach((user) => {
      delete user.refreshTokenHash;
      delete user.hash;
    });

    return users;
  });

  userDelete = asyncErrorHandler(async (userId: ConfigId) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { deleted: true },
    });
  });

  userBack = asyncErrorHandler(async (userId: ConfigId) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { deleted: false },
    });

    delete updatedUser.hash;

    return updatedUser;
  });

  dangerUserDelete = asyncErrorHandler(async (userId: ConfigId) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({ where: { id: userId } });
  });

  constructor(private prisma: PrismaService) {}
}
