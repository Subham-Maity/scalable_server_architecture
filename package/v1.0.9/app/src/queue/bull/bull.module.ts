import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Mail0AuthService, MailConfig, MailModule } from '../../mail';
import { BullService } from './bull.service';
import { FAIL_JOB_QUEUE, GEO_LOGS_QUEUE, MAIL_QUEUE } from './constant';
import { GeoService } from '../../iam/geo/geo.service';
import { GeoLogsProcessor, MailJobs } from './jobs';
import { BullConfig } from './config';

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
          // Enable shared Redis connection
          useSharedConnection: true,
          // Enable ready check for Redis
          enableReadyCheck: true,
          // Enable offline queue mode
          enableOfflineQueue: true,
          streams: {
            // Enable Redis Streams
            enableStreams: true,
            // Maximum length of a Redis stream in milliseconds
            streamMaxLengthMaxMs: 5000,
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
    MailJobs,
    BullConfig,
    MailConfig,
    Mail0AuthService,
    BullService,
  ],
  exports: [BullModule, BullService],
})
export class QueueModule {}
