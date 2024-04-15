import { Prisma } from '@prisma/client';
import { GetAllPermissionsDto } from '../../dto';

export class SearchService {
  getSearchParams(dto: GetAllPermissionsDto) {
    const { q } = dto;
    const where: Prisma.PermissionWhereInput = {};

    if (q) {
      where.OR = [{ name: { contains: q } }, { action: { contains: q } }];
    }

    return { where };
  }
}
