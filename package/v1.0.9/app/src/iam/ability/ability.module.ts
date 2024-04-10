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
import { RoleModule } from './features/roles/role.module';

@Module({
  imports: [RoleModule],
  controllers: [PermissionsController, RelationsController, SupremeController],
  providers: [PermissionsService, RelationsService, SupremeService, SaEmailIpWhitelistConstant],
})
export class AbilityModule {}
