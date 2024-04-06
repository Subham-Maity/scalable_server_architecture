import { Prisma } from '@prisma/client';
import { GetAllUsersDto } from '../../dto';

export class SearchService {
  getSearchParams(dto: GetAllUsersDto) {
    //Query params: q - search term
    const { q } = dto;
    //Where params: where - search term
    const where: Prisma.UserWhereInput = {};

    //Search by email, firstName, lastName, OR search term in all fields.
    if (q) {
      where.OR = [
        { email: { contains: q } },
        { firstName: { contains: q } },
        { lastName: { contains: q } },
      ];
    }

    return { where };
  }
}
