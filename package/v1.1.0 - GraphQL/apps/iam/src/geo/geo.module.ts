import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { LoggerService } from './query/get-all-geo/logger';
import {
  FilterService,
  PaginationService,
  SearchService,
  SortService,
} from './query/get-all-geo';
import { RedisModule } from '../redis';

@Module({
  imports: [RedisModule],
  controllers: [GeoController],
  providers: [
    GeoService,
    LoggerService,
    FilterService,
    PaginationService,
    SearchService,
    SortService,
  ],
  exports: [
    GeoService,
    LoggerService,
    FilterService,
    PaginationService,
    SearchService,
    SortService,
  ],
})
export class GeoModule {}
