import { Injectable, NotFoundException } from '@nestjs/common';
import { EditUserDto, GetAllUsersDto } from './dto';
import { ConfigId } from '../types';
import { asyncErrorHandler } from '../errors';
import { PrismaService } from '../prisma';
import { FilterService, PaginationService, SearchService, SortService } from './query';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly sortService: SortService,
    private readonly searchService: SearchService,
    private readonly filterService: FilterService,
  ) {}
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

  getAllUsers = asyncErrorHandler(async (dto: GetAllUsersDto) => {
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
}
