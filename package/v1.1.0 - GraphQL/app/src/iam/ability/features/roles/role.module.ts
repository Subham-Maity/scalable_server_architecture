import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RedisService } from '../../../../redis';
import { FilterService, PaginationService, SearchService, SortService } from './query';
import { SaEmailIpWhitelistConstant } from '../../guard/list';

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
