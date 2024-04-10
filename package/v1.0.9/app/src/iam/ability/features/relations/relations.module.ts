import { Module } from '@nestjs/common';
import { RedisService } from '../../../../redis';

import { RelationsService } from './relations.service';
import { RelationsController } from './relations.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [RelationsController],
  providers: [RedisService, RelationsService],
})
export class RelationsModule {}
