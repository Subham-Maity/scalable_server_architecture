import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './jobs/mail.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullConfig } from './config/bull.config';
import { Mail0AuthService, MailConfig, MailModule } from '../../mail';
import { BullService } from './bull.service';
import { FAIL_JOB_QUEUE, GEO_LOGS_QUEUE, MAIL_QUEUE } from './constant';
import { GeoLogsProcessor } from './jobs/geo-logs.processor';
import { GeoService } from '../../iam/geo/geo.service';

//docker run -p 6379:6379 redis
@Module({
  imports: [
    MailModule,
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const bullConfig = new BullConfig(configService);
        return {
          redis: {
            host: bullConfig.RedisHost,
            port: bullConfig.RedisPort,
            username: bullConfig.RedisUsername,
            password: bullConfig.RedisPassword,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
    BullModule.registerQueue({
      name: GEO_LOGS_QUEUE,
    }),
    BullModule.registerQueue({ name: FAIL_JOB_QUEUE }),
  ],
  providers: [
    GeoLogsProcessor,
    GeoService,
    MailProcessor,
    BullConfig,
    MailConfig,
    Mail0AuthService,
    BullService,
  ],
  exports: [BullModule, BullService],
})
export class QueueModule {}
