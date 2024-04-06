import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FilterService, PaginationService, SearchService, SortService } from './query';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisService } from '../../redis';
import { SaEmailIpWhitelistConstant } from '../ability/guard/list';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 3000,
        limit: 3,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UserService,
    PaginationService,
    SortService,
    FilterService,
    SearchService,
    RedisService,
    SaEmailIpWhitelistConstant,
  ],
})
export class UserModule {}
