import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guard';
import { AbilityModule } from './ability/ability.module';
import { GeoUtilController } from './geo/geo.controller';
import { GeoUtilService } from './geo/geo.service';

@Module({
  imports: [AuthModule, UserModule, AbilityModule],
  controllers: [GeoUtilController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    GeoUtilService,
  ],
})
export class IamModule {}
