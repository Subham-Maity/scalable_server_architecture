import { Module } from '@nestjs/common';
import { RoleModule } from './features/roles/role.module';
import { PermissionsModule } from './features/permissions/permissions.module';
import { RelationsModule } from './features/relations/relations.module';
import { SupremeModule } from './features/supreme/supreme.module';

@Module({
  imports: [RoleModule, PermissionsModule, RelationsModule, SupremeModule],
})
export class AbilityModule {}
