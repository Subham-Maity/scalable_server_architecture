import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GEO_LOGS_QUEUE } from '../constant';
import { GeoService } from '../../../iam/geo/geo.service';
import { BullService } from '../bull.service';
import { GeoLogJob } from '../types/geo-logs.i';

@Processor(GEO_LOGS_QUEUE)
export class GeoLogsProcessor {
  private readonly logger = new Logger(GeoLogsProcessor.name);

  constructor(
    private readonly geoService: GeoService,
    private readonly queueService: BullService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.log(`Job ${job.id} has completed. Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  async onError(job: Job, error: any) {
    this.logger.error(`Job ${job.id} has failed. Error: ${error.message}`, error.stack);

    try {
      await this.queueService.addJobToFailedQueue({
        type: job.name,
        data: job.data,
      });
    } catch (error) {
      this.logger.error(`Failed to add job to failed queue. Error: ${error.message}`, error.stack);
    }
  }

  @Process('geo-track')
  async handleGeoTrack(job: Job<GeoLogJob>) {
    try {
      const { ipAddress, action, userAgent, userId, email, reason } = job.data;
      await this.geoService.geoTrack(ipAddress, action, userAgent, userId, email, reason);
      this.logger.log(`Geo log processed successfully for job ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process geo log for job ${job.id}`, error.stack);
      throw error;
    }
  }
}
