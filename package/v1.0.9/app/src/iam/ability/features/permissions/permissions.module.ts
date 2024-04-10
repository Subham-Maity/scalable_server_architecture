import { Module } from '@nestjs/common';
import { RedisService } from '../../../../redis';
import { FilterService, PaginationService, SearchService, SortService } from './query';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { LoggerService } from './query/get-all-permissions/logger';

@Module({
  controllers: [PermissionsController],
  providers: [
    LoggerService,
    PermissionsService,
    RedisService,
    FilterService,
    PaginationService,
    SearchService,
    SortService,
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
