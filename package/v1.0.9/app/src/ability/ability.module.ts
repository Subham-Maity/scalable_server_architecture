import { Module } from '@nestjs/common';
import { PermissionsController, PermissionsService, RolesController, RolesService } from './roles';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService],
})
export class AbilityModule {}
