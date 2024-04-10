import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { GetAllGeoDto } from '../../dto';

@Injectable()
export class SearchService {
  getSearchParams(dto: GetAllGeoDto): { where: Prisma.GeoLogWhereInput } {
    const { q } = dto;
    const where: Prisma.GeoLogWhereInput = {};

    if (q) {
      where.OR = [
        { email: { contains: q } },
        { ipAddress: { contains: q } },
        { action: { contains: q } },
        { userAgent: { contains: q } },
      ];
    }

    return { where };
  }
}
