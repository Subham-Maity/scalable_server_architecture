import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { AtGuard } from './auth/guard';
import { APP_GUARD } from '@nestjs/core';
import { LoggerMiddleware } from './utils';
import { PrismaModule } from './prisma';
import { BullService, QueueModule } from './queue/bull';
import { validateConfig } from './validation/config.joi';
import { RedisModule } from './redis';
import { AbilityModule } from './ability/ability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validateConfig,
    }),

    AuthModule,
    UserModule,
    PrismaModule,
    QueueModule,
    RedisModule,
    AbilityModule,
  ],
  //purpose: add AtGuard to the global guard list
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    BullService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
