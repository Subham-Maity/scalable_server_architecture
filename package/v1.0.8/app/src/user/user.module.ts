import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FilterService, PaginationService, SearchService, SortService } from './query';
import { RedisService } from '../redis';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PaginationService,
    SortService,
    FilterService,
    SearchService,
    RedisService,
  ],
})
export class UserModule {}
