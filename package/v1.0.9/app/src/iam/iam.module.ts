import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guard';
import { AbilityModule } from './ability/ability.module';
import { GeoModule } from './geo/geo.module';

@Module({
  imports: [AuthModule, UserModule, AbilityModule, GeoModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class IamModule {}
