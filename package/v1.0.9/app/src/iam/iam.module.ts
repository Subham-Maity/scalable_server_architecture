import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guard';
import { AbilityModule } from './ability/ability.module';
import { GeoController } from './geo/geo.controller';
import { GeoService } from './geo/geo.service';

@Module({
  imports: [AuthModule, UserModule, AbilityModule],
  controllers: [GeoController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    GeoService,
  ],
})
export class IamModule {}
