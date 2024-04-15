import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guard';
import { AbilityModule } from './ability/ability.module';
import { GeoModule } from './geo/geo.module';
import { RedisModule } from './redis';
import { ConfigModule } from '@nestjs/config';
import { validateConfig } from '../validation';
import configuration from '../config/config';
import { PrismaModule } from '../../../prisma';
import { BullService, QueueModule } from './queue/bull';
import { LoggerMiddleware } from '@app/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validateConfig,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
    }),
    AuthModule,
    UserModule,
    AbilityModule,
    GeoModule,
    RedisModule,
    IamModule,
    PrismaModule,
    QueueModule,
    RedisModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    BullService,
  ],
})
export class IamModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
