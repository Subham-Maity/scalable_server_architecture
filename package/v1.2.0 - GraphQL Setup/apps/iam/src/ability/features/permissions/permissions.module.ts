import { Module } from '@nestjs/common';
import {
  FilterService,
  PaginationService,
  SearchService,
  SortService,
} from './query';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { LoggerService } from './query/get-all-permissions/logger';
import { SaEmailIpWhitelistConstant } from '../../guard/list';
import { RedisService } from '../../../redis';

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
    SaEmailIpWhitelistConstant,
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
