import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EditUserDto, GetAllUsersDto } from './dto';
import { ConfigId } from '../types';
import { asyncErrorHandler } from '../errors';
import { PrismaService } from '../prisma';
import { FilterService, PaginationService, SearchService, SortService } from './query';
import { users_key_prefix_for_redis } from './constant';
import { RedisService } from '../redis';
import { sanitize } from '../utils';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly sortService: SortService,
    private readonly searchService: SearchService,
    private readonly filterService: FilterService,
    private readonly redisService: RedisService,
  ) {}
  /**Edit User*/
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

    return updatedUser;
  });

  /**Get User Id*/
  getUserById = asyncErrorHandler(async (id: string) => {
    const cacheKey: string = `${users_key_prefix_for_redis}{id}`;

    try {
      const cachedUser = await this.redisService.get(cacheKey);

      if (cachedUser) {
        Logger.debug(`fn: getUserById, Cache hit for ${cacheKey}`);
        return cachedUser;
      }
    } catch (error) {
      Logger.error(`fn: getUserById, Error getting data from Redis for key ${cacheKey}`, error);
    }

    Logger.error(`fn: getUserById, Cache miss`);

    const user = await this.prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sanitizedUser = sanitize(user, ['hash']);

    try {
      await this.redisService.set(cacheKey, sanitizedUser, 120);
    } catch (error) {
      Logger.error('fn: getUserById, Error setting data to Redis', error);
    }

    return sanitizedUser;
  });

  /**Get All Users*/
  getAllUsers = asyncErrorHandler(async (dto: GetAllUsersDto) => {
    /**Redis Setup */
    /**____GET_Redis____*/
    const cacheKey: string = `${users_key_prefix_for_redis}${JSON.stringify(dto)}`;

    try {
      const cachedUsers = await this.redisService.get(cacheKey);

      if (cachedUsers) {
        Logger.debug(`fn: getAllUsers, Cache hit for ${cacheKey}`);
        return cachedUsers;
      }
    } catch (error) {
      Logger.error(`fn: getAllUsers, Error getting data from Redis for key ${cacheKey}`, error);
    }

    Logger.error(`fn: getAllUsers, Cache miss`);
    /**----End----*/

    const { skip, take } = this.paginationService.getPaginationParams(dto);
    const { orderBy } = this.sortService.getSortParams(dto);
    const { where: searchWhere } = this.searchService.getSearchParams(dto);
    const { where: filterWhere } = this.filterService.getFilterParams(dto);

    const users = await this.prisma.user.findMany({
      skip,
      take,
      orderBy,
      where: { ...searchWhere, ...filterWhere },
    });

    if (!users.length) {
      throw new NotFoundException('No users found');
    }

    const sanitizedUsers = users.map((user) => sanitize(user, ['hash']));

    /**____SET_Redis____*/
    try {
      await this.redisService.set(cacheKey, sanitizedUsers, 30);
    } catch (error) {
      Logger.error('fn: getAllUsers, Error setting data to Redis', error);
    }
    /**----End----*/

    return sanitizedUsers;
  });

  /**Delete A User*/
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

  /**Return That Deleted User*/
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

  /**Danger User Delete*/
  dangerUserDelete = asyncErrorHandler(async (userId: ConfigId) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({ where: { id: userId } });
  });
}
