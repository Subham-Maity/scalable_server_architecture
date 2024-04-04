import { Module } from '@nestjs/common';
import { RolesController, RolesService } from './roles';
import { PermissionsController, PermissionsService } from './permissions';
import { SupremeController, SupremeService } from './supreme';

@Module({
  controllers: [RolesController, PermissionsController, SupremeController],
  providers: [RolesService, PermissionsService, SupremeService],
})
export class AbilityModule {}