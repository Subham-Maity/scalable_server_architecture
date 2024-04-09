import { Module } from '@nestjs/common';
import { SaEmailIpWhitelistConstant } from './guard/list';
import {
  PermissionsController,
  PermissionsService,
  RelationsController,
  RelationsService,
  RolesController,
  RolesService,
  SupremeController,
  SupremeService,
} from './features';

@Module({
  controllers: [RolesController, PermissionsController, RelationsController, SupremeController],
  providers: [
    RolesService,
    PermissionsService,
    RelationsService,
    SupremeService,
    SaEmailIpWhitelistConstant,
  ],
})
export class AbilityModule {}
