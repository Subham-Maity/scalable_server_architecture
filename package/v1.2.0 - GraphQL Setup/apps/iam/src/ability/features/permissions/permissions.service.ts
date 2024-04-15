import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from '@prisma/client';

import { GetAllPermissionsDto, UpdatePermissionDto, UserIdDto } from './dto';

import {
  FilterService,
  PaginationService,
  SearchService,
  SortService,
} from './query';
import { permissions_key_prefix_for_redis } from './constant';
import { PrismaService } from '../../../../../../prisma';
import { RedisService } from '../../../redis';

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    private sortService: SortService,
  ) {}

  async createPermission(name: string, action: string): Promise<Permission> {
    if (!name || !action) {
      throw new BadRequestException('Name and action are required.');
    }

    const newPermission = await this.prisma.permission.create({
      data: {
        name,
        action,
      },
    });

    // Clear the cache for permissions
    await this.redisService.delPatternSpecific(
      permissions_key_prefix_for_redis,
    );
    Logger.debug(
      `fn: createPermission, Cache cleared for pattern ${permissions_key_prefix_for_redis}*`,
    );

    return newPermission;
  }

  async getPermissions(dto: GetAllPermissionsDto) {
    const cacheKey: string = `${permissions_key_prefix_for_redis}${JSON.stringify(dto)}`;

    try {
      const cachedPermissions = await this.redisService.get(cacheKey);
      if (cachedPermissions) {
        Logger.debug(`fn: getPermissions, Cache hit for ${cacheKey}`);
        return cachedPermissions as Permission[];
      }
    } catch (error) {
      Logger.error(
        `fn: getPermissions, Error getting data from Redis for key ${cacheKey}`,
        error,
      );
    }

    Logger.error(`fn: getPermissions, Cache miss`);

    const { skip, take } = this.paginationService.getPaginationParams(dto);
    const { orderBy } = this.sortService.getSortParams(dto);
    const { where: searchWhere } = this.searchService.getSearchParams(dto);
    const { where: filterWhere } = this.filterService.getFilterParams(dto);

    const permissions = await this.prisma.permission.findMany({
      skip,
      take,
      orderBy,
      where: { ...searchWhere, ...filterWhere },
    });

    if (!permissions.length) {
      throw new NotFoundException('No permissions found');
    }

    try {
      await this.redisService.set(cacheKey, permissions, 5000);
    } catch (error) {
      Logger.error('fn: getPermissions, Error setting data to Redis', error);
    }

    return permissions;
  }

  async getPermissionById(id: UserIdDto): Promise<Permission | null> {
    if (!id.id) {
      throw new BadRequestException('Invalid user ID.');
    }

    const cacheKey = `${permissions_key_prefix_for_redis}${id.id}`;

    try {
      const cachedPermission = await this.redisService.get(cacheKey);
      if (cachedPermission) {
        Logger.debug(`fn: getPermissionById, Cache hit for ${cacheKey}`);
        return cachedPermission as Permission;
      }
    } catch (error) {
      Logger.error(
        `fn: getPermissionById, Error getting data from Redis for key ${cacheKey}`,
        error,
      );
    }

    Logger.error(`fn: getPermissionById, Cache miss`);

    const permission = await this.prisma.permission.findUnique({
      where: { id: id.id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }

    try {
      await this.redisService.set(cacheKey, permission, 30);
    } catch (error) {
      Logger.error('fn: getPermissionById, Error setting data to Redis', error);
    }

    return permission;
  }

  async getPermissionsByNames(names: string[]): Promise<Permission[]> {
    if (names.length === 0) {
      throw new BadRequestException(
        'At least one permission name is required.',
      );
    }

    const cacheKey = `${permissions_key_prefix_for_redis}names:${JSON.stringify(names)}`;

    try {
      const cachedPermissions = await this.redisService.get(cacheKey);
      if (cachedPermissions) {
        Logger.debug(`fn: getPermissionsByNames, Cache hit for ${cacheKey}`);
        return cachedPermissions as Permission[];
      }
    } catch (error) {
      Logger.error(
        `fn: getPermissionsByNames, Error getting data from Redis for key ${cacheKey}`,
        error,
      );
    }

    Logger.error(`fn: getPermissionsByNames, Cache miss`);

    const permissions = await this.prisma.permission.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    try {
      await this.redisService.set(cacheKey, permissions, 30);
    } catch (error) {
      Logger.error(
        'fn: getPermissionsByNames, Error setting data to Redis',
        error,
      );
    }

    return permissions;
  }

  async updatePermissionById(
    id: UserIdDto,
    data: UpdatePermissionDto,
  ): Promise<Permission> {
    if (!data.name || !data.action) {
      throw new BadRequestException('Name and action are required.');
    }

    const updatedPermission = await this.prisma.permission.update({
      where: { id: id.id },
      data: {
        name: data.name,
        action: data.action,
      },
    });

    if (!updatedPermission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }

    // Clear the cache for the specific permission
    const cacheKey = `${permissions_key_prefix_for_redis}${id.id}`;
    await this.redisService.del(cacheKey);
    Logger.debug(`fn: updatePermissionById, Cache cleared for ${cacheKey}`);

    // Clear the cache for all permissions
    await this.redisService.delPatternSpecific(
      permissions_key_prefix_for_redis,
    );
    Logger.debug(
      `fn: updatePermissionById, Cache cleared for pattern ${permissions_key_prefix_for_redis}*`,
    );

    return updatedPermission;
  }

  async deletePermissionById(id: UserIdDto): Promise<void> {
    if (!id.id) {
      throw new BadRequestException('Invalid user ID.');
    }

    const deletedPermission = await this.prisma.permission.delete({
      where: { id: id.id },
    });

    if (!deletedPermission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }

    // Clear the cache for the specific permission
    const cacheKey = `${permissions_key_prefix_for_redis}${id.id}`;
    await this.redisService.del(cacheKey);
    Logger.debug(`fn: deletePermissionById, Cache cleared for ${cacheKey}`);

    // Clear the cache for all permissions
    await this.redisService.delPatternSpecific(
      permissions_key_prefix_for_redis,
    );
    Logger.debug(
      `fn: deletePermissionById, Cache cleared for pattern ${permissions_key_prefix_for_redis}*`,
    );
  }
}
