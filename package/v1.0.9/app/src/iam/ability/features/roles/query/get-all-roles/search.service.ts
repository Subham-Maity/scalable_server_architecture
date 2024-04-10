import { Prisma } from '@prisma/client';
import { GetAllRolesDto } from '../../dto';

export class SearchService {
  getSearchParams(dto: GetAllRolesDto) {
    const { q } = dto;
    const where: Prisma.RoleWhereInput = {};

    if (q) {
      where.name = { contains: q };
    }

    return { where };
  }
}
