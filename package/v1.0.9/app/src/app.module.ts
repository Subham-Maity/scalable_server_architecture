import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { LoggerMiddleware } from './utils';
import { PrismaModule } from './prisma';
import { BullService, QueueModule } from './queue/bull';
import { validateConfig } from './validation/config.joi';
import { RedisModule } from './redis';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validateConfig,
    }),
    IamModule,
    PrismaModule,
    QueueModule,
    RedisModule,
  ],
  //purpose: add AtGuard to the global guard list
  providers: [BullService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
