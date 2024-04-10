import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RedisService } from '../../../../redis';
import { FilterService, PaginationService, SearchService, SortService } from './query';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    RedisService,
    FilterService,
    PaginationService,
    SearchService,
    SortService,
  ],
})
export class RoleModule {}
