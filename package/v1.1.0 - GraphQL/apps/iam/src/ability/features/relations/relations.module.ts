import { Module } from '@nestjs/common';
import { RelationsService } from './relations.service';
import { RelationsController } from './relations.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { RedisService } from '../../../redis';

@Module({
  imports: [PermissionsModule],
  controllers: [RelationsController],
  providers: [RedisService, RelationsService],
})
export class RelationsModule {}
