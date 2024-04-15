import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

import {
  FilterService,
  PaginationService,
  SearchService,
  SortService,
} from './query';
import { SaEmailIpWhitelistConstant } from '../../guard/list';
import { RedisService } from '../../../redis';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    RedisService,
    FilterService,
    PaginationService,
    SearchService,
    SortService,
    SaEmailIpWhitelistConstant,
  ],
})
export class RoleModule {}
