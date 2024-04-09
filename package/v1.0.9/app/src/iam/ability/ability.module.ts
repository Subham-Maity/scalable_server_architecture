import { Module } from '@nestjs/common';
import { SaEmailIpWhitelistConstant } from './guard/list';
import {
  PermissionsController,
  PermissionsService,
  RolesController,
  RolesService,
  SupremeController,
  SupremeService,
} from './features';

@Module({
  controllers: [RolesController, PermissionsController, SupremeController],
  providers: [RolesService, PermissionsService, SupremeService, SaEmailIpWhitelistConstant],
})
export class AbilityModule {}
