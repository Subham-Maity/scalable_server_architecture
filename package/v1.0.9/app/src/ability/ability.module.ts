import { Module } from '@nestjs/common';
import { RolesController, RolesService } from './roles';
import { PermissionsController, PermissionsService } from './permissions';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService],
})
export class AbilityModule {}
