import {
  Process,
  Processor,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GeoLogJob } from '../types';

@Processor('failed_geo_logs')
export class FailedGeoLogsProcessor {
  private readonly logger = new Logger(FailedGeoLogsProcessor.name);

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing failed job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.log(
      `Failed job ${job.id} has been processed. Result: ${JSON.stringify(result)}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job, error: any) {
    this.logger.error(
      `Failed to process job ${job.id}. Error: ${error.message}`,
      error.stack,
    );
  }

  @Process('geo-track')
  async processFailedGeoLogJob(job: Job<GeoLogJob>) {
    // Here you can handle the failed geo log job. For example, you can log the job data:
    this.logger.error(
      `Failed to process geo log for job ${job.id}. Job data: ${JSON.stringify(job.data)}`,
    );

    //TODO
    // You can also implement additional logic to handle failed geo log jobs,
    // such as sending notifications, retrying with different configurations, etc.
  }
}
