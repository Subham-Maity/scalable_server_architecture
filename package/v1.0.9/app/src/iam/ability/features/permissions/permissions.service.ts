import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PrismaService } from '../../../../prisma';
import { GetAllPermissionsDto, UpdatePermissionDto, UserIdDto } from './dto';
import { asyncErrorHandler } from '../../../../errors';
import { RedisService } from '../../../../redis';
import { FilterService, PaginationService, SearchService, SortService } from './query';
import { permissions_key_prefix_for_redis } from './constant';

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

  createPermission = asyncErrorHandler(
    async (name: string, action: string): Promise<Permission> => {
      if (!name || !action) {
        throw new BadRequestException('Name and action are required.');
      }

      return this.prisma.permission.create({
        data: {
          name,
          action,
        },
      });
    },
  );

  getPermissions = asyncErrorHandler(async (dto: GetAllPermissionsDto) => {
    const cacheKey: string = `${permissions_key_prefix_for_redis}${JSON.stringify(dto)}`;

    try {
      const cachedPermissions = await this.redisService.get(cacheKey);
      if (cachedPermissions) {
        Logger.debug(`fn: getPermissions, Cache hit for ${cacheKey}`);
        return cachedPermissions as Permission[];
      }
    } catch (error) {
      Logger.error(`fn: getPermissions, Error getting data from Redis for key ${cacheKey}`, error);
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
      await this.redisService.set(cacheKey, permissions, 30);
    } catch (error) {
      Logger.error('fn: getPermissions, Error setting data to Redis', error);
    }

    return permissions;
  });

  getPermissionById = asyncErrorHandler(async (id: UserIdDto): Promise<Permission | null> => {
    if (!id.id) {
      throw new BadRequestException('Invalid user ID.');
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: id.id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }

    return permission;
  });

  getPermissionsByNames = asyncErrorHandler(async (names: string[]): Promise<Permission[]> => {
    if (names.length === 0) {
      throw new BadRequestException('At least one permission name is required.');
    }

    return this.prisma.permission.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  });

  updatePermissionById = asyncErrorHandler(
    async (id: UserIdDto, data: UpdatePermissionDto): Promise<Permission> => {
      if (!data.name || !data.action) {
        throw new BadRequestException('Name and action are required.');
      }

      const permission = await this.prisma.permission.update({
        where: { id: id.id },
        data: {
          name: data.name,
          action: data.action,
        },
      });

      if (!permission) {
        throw new NotFoundException(`Permission with ID ${id.id} not found.`);
      }

      return permission;
    },
  );

  deletePermissionById = asyncErrorHandler(async (id: UserIdDto): Promise<void> => {
    if (!id.id) {
      throw new BadRequestException('Invalid user ID.');
    }
    const permission = await this.prisma.permission.delete({
      where: { id: id.id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }
  });
}
