import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EditUserDto, GetAllUsersDto } from './dto';
import {
  FilterService,
  PaginationService,
  SearchService,
  SortService,
} from './query';
import { users_key_prefix_for_redis } from './constant';

import { sanitize } from '../common';
import { ConfigId } from '../common/type';
import { RedisService } from '../redis';
import { PrismaService } from '../../../../prisma';

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
  async editUser(userId: ConfigId, dto: EditUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
    delete updatedUser.hash;
    // Clear the cache for the user
    const userCacheKey = `${users_key_prefix_for_redis}${userId}`;
    await this.redisService.del(userCacheKey);
    Logger.debug(`fn: editUser, Cache cleared for ${userCacheKey}`);
    return updatedUser;
  }

  /**Get User Id*/
  async getUserById(id: ConfigId) {
    const cacheKey: string = `${users_key_prefix_for_redis}${id}`;

    try {
      const cachedUser = await this.redisService.get(cacheKey);

      if (cachedUser) {
        Logger.debug(`fn: getUserById, Cache hit for ${cacheKey}`);
        return cachedUser;
      }
    } catch (error) {
      Logger.error(
        `fn: getUserById, Error getting data from Redis for key ${cacheKey}`,
        error,
      );
    }

    Logger.error(`fn: getUserById, Cache miss`);

    const user = await this.prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sanitizedUser = sanitize(user, ['hash']);

    try {
      await this.redisService.set(cacheKey, sanitizedUser, 5000);
    } catch (error) {
      Logger.error('fn: getUserById, Error setting data to Redis', error);
    }

    return sanitizedUser;
  }

  /**Get All Users*/
  async getAllUsers(dto: GetAllUsersDto) {
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
      Logger.error(
        `fn: getAllUsers, Error getting data from Redis for key ${cacheKey}`,
        error,
      );
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
      await this.redisService.set(cacheKey, sanitizedUsers, 5000);
    } catch (error) {
      Logger.error('fn: getAllUsers, Error setting data to Redis', error);
    }
    /**----End----*/

    return sanitizedUsers;
  }

  /**Delete A User*/
  async userDelete(userId: ConfigId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Clear the cache for the user
    const userCacheKey = `${users_key_prefix_for_redis}${userId}`;
    await this.redisService.del(userCacheKey);
    Logger.debug(`fn: userDelete, Cache cleared for ${userCacheKey}`);

    //Return the user
    return this.prisma.user.update({
      where: { id: userId },
      data: { deleted: true },
    });
  }

  /**Return That Deleted User*/
  async userBack(userId: ConfigId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { deleted: false },
    });

    delete updatedUser.hash;
    // Clear the cache for the user
    const userCacheKey = `${users_key_prefix_for_redis}${userId}`;
    await this.redisService.del(userCacheKey);
    Logger.debug(`fn: userBack, Cache cleared for ${userCacheKey}`);
    return updatedUser;
  }

  /**Danger User Delete*/
  async dangerUserDelete(userId: ConfigId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Clear the cache for the user
    const userCacheKey = `${users_key_prefix_for_redis}${userId}`;
    await this.redisService.del(userCacheKey);
    Logger.debug(`fn: dangerUserDelete, Cache cleared for ${userCacheKey}`);

    return this.prisma.user.delete({ where: { id: userId } });
  }
}
