import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma';
import { ConfigService } from '@nestjs/config';
import { asyncErrorHandler } from '../../errors';
import { geo_key_prefix_for_redis } from './constant';
import { GeoLog } from '@prisma/client';
import { GetAllGeoDto } from './dto';
import { RedisService } from '../../redis';
import { FilterService, PaginationService, SearchService, SortService } from './query/get-all-geo';

@Injectable()
export class GeoService {
  private ipApiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private redisService: RedisService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    private sortService: SortService,
  ) {
    this.ipApiUrl = this.configService.get<string>('IP_API_URL');
  }

  async geoTrack(
    ipAddress: string,
    action: string,
    userAgent: string,
    userId?: string | null,
    email?: string | null,
    reason?: string,
  ) {
    let user: any;

    if (userId) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
    } else if (email) {
      user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
    } else {
      throw new Error('Either userId or email must be provided');
    }

    return this.prisma.geoLog.create({
      data: {
        userId: userId || user.id,
        email: email || user.email,
        ipAddress,
        action,
        userAgent,
        reason,
      },
    });
  }

  async getIpDetails(ipAddress: string) {
    const ipDetailsUrl = `${this.ipApiUrl}/${ipAddress}`;
    const ipDetails = await axios.get(ipDetailsUrl);
    return ipDetails.data;
  }
  getAllGeoLogs = asyncErrorHandler(async (dto: GetAllGeoDto): Promise<GeoLog[]> => {
    const cacheKey = `${geo_key_prefix_for_redis}${JSON.stringify(dto)}`;

    // Check if the data is cached in Redis
    try {
      const cachedGeoLogs = await this.redisService.get(cacheKey);
      if (cachedGeoLogs) {
        Logger.debug(`fn: getAllGeoLogs, Cache hit for ${cacheKey}`);
        return cachedGeoLogs as GeoLog[];
      }
    } catch (error) {
      Logger.error(`fn: getAllGeoLogs, Error getting data from Redis for key ${cacheKey}`, error);
    }

    Logger.error(`fn: getAllGeoLogs, Cache miss`);

    // Get the pagination parameters
    const { skip, take } = this.paginationService.getPaginationParams(dto);

    // Get the sort parameters
    const { orderBy } = this.sortService.getSortParams(dto);

    // Get the search parameters
    const { where: searchWhere } = this.searchService.getSearchParams(dto);

    // Get the filter parameters
    const { where: filterWhere } = this.filterService.getFilterParams(dto);

    // Fetch the geo logs from the database
    const geoLogs = await this.prisma.geoLog.findMany({
      skip,
      take,
      orderBy,
      where: { ...searchWhere, ...filterWhere },
    });

    if (!geoLogs.length) {
      throw new NotFoundException('No geoLogs found');
    }
    // Cache the geo logs in Redis
    try {
      await this.redisService.set(cacheKey, geoLogs, 30);
    } catch (error) {
      Logger.error('fn: getAllGeoLogs, Error setting data to Redis', error);
    }

    return geoLogs;
  });
}
