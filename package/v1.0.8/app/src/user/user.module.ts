import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FilterService, PaginationService, SearchService, SortService } from './query';

@Module({
  controllers: [UserController],
  providers: [UserService, PaginationService, SortService, FilterService, SearchService],
})
export class UserModule {}
