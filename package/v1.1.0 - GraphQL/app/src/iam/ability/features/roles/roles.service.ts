import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../../prisma';
import { asyncErrorHandler } from '../../../../errors';
import { RedisService } from '../../../../redis';
import { GetAllRolesDto } from './dto';
import { roles_key_prefix_for_redis } from './constant';
import { FilterService, PaginationService, SearchService, SortService } from './query';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    private sortService: SortService,
  ) {}
  createAdminRole = asyncErrorHandler(async (): Promise<Role> => {
    const existingAdminRole = await this.prisma.role.findUnique({
      where: { name: 'Admin' },
    });

    if (existingAdminRole) {
      throw new BadRequestException('Admin role already exists.');
    }

    const newAdminRole = await this.prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Can do everything',
      },
    });

    // Clear the cache for roles
    await this.redisService.delPatternSpecific(roles_key_prefix_for_redis);
    Logger.debug(`fn: createAdminRole, Cache cleared for pattern ${roles_key_prefix_for_redis}*`);

    return newAdminRole;
  });

  createRole = asyncErrorHandler(async (name: string, description?: string): Promise<Role> => {
    if (!name) {
      throw new BadRequestException('Role name is required.');
    }

    const newRole = await this.prisma.role.create({
      data: {
        name,
        description,
      },
    });

    // Clear the cache for roles
    await this.redisService.delPatternSpecific(roles_key_prefix_for_redis);
    Logger.debug(`fn: createRole, Cache cleared for pattern ${roles_key_prefix_for_redis}*`);

    return newRole;
  });

  getRoles = asyncErrorHandler(async (dto: GetAllRolesDto): Promise<Role[]> => {
    // Redis setup
    const cacheKey: string = `${roles_key_prefix_for_redis}${JSON.stringify(dto)}`;

    try {
      const cachedRoles = await this.redisService.get(cacheKey);
      if (cachedRoles) {
        Logger.debug(`fn: getRoles, Cache hit for ${cacheKey}`);
        return cachedRoles as Role[];
      }
    } catch (error) {
      Logger.error(`fn: getRoles, Error getting data from Redis for key ${cacheKey}`, error);
    }

    Logger.error(`fn: getRoles, Cache miss`);

    const { skip, take } = this.paginationService.getPaginationParams(dto);
    const { orderBy } = this.sortService.getSortParams(dto);
    const { where: searchWhere } = this.searchService.getSearchParams(dto);
    const { where: filterWhere } = this.filterService.getFilterParams(dto);

    const roles = await this.prisma.role.findMany({
      skip,
      take,
      orderBy,
      where: { ...searchWhere, ...filterWhere },
    });

    if (!roles.length) {
      throw new NotFoundException('No roles found');
    }

    try {
      await this.redisService.set(cacheKey, roles, 5000);
    } catch (error) {
      Logger.error('fn: getRoles, Error setting data to Redis', error);
    }
    return roles;
  });

  getRoleById = asyncErrorHandler(async (id: string): Promise<Role | null> => {
    if (!id) {
      throw new BadRequestException('Invalid role ID.');
    }

    const cacheKey = `${roles_key_prefix_for_redis}${id}`;

    try {
      const cachedRole = await this.redisService.get(cacheKey);
      if (cachedRole) {
        Logger.debug(`fn: getRoleById, Cache hit for ${cacheKey}`);
        return cachedRole as Role;
      }
    } catch (error) {
      Logger.error(`fn: getRoleById, Error getting data from Redis for key ${cacheKey}`, error);
    }

    Logger.error(`fn: getRoleById, Cache miss`);

    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    try {
      await this.redisService.set(cacheKey, role, 5000);
    } catch (error) {
      Logger.error('fn: getRoleById, Error setting data to Redis', error);
    }

    return role;
  });

  updateRoleName = asyncErrorHandler(
    async (id: string, name: string, description?: string): Promise<Role> => {
      if (!id || !name) {
        throw new BadRequestException('Role ID and name are required.');
      }

      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: { name, description },
      });

      if (!updatedRole) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      // Clear the cache for roles
      await this.redisService.delPatternSpecific(roles_key_prefix_for_redis);
      Logger.debug(`fn: updateRoleName, Cache cleared for pattern ${roles_key_prefix_for_redis}*`);

      return updatedRole;
    },
  );

  deleteRole = asyncErrorHandler(async (id: string): Promise<Role> => {
    const [, deletedRole] = await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      }),
      this.prisma.role.delete({
        where: { id },
      }),
    ]);

    // Clear the cache for roles
    await this.redisService.delPatternSpecific(roles_key_prefix_for_redis);
    Logger.debug(`fn: deleteRole, Cache cleared for pattern ${roles_key_prefix_for_redis}*`);

    return deletedRole;
  });
}
