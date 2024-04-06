import { Module } from '@nestjs/common';
import { RolesController, RolesService } from './roles';
import { PermissionsController, PermissionsService } from './permissions';
import { SupremeController, SupremeService } from './supreme';
import { SaEmailIpWhitelistConstant } from './guard/list';

@Module({
  controllers: [RolesController, PermissionsController, SupremeController],
  providers: [RolesService, PermissionsService, SupremeService, SaEmailIpWhitelistConstant],
})
export class AbilityModule {}
