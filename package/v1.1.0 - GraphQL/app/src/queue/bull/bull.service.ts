import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { FAIL_JOB_QUEUE, GEO_LOGS_QUEUE, MAIL_QUEUE } from './constant';
import { GeoLogJob, JobData } from './types';

@Injectable()
export class BullService {
  private readonly logger = new Logger(BullService.name);

  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
    @InjectQueue(GEO_LOGS_QUEUE) private readonly geoLogQueue: Queue,
    @InjectQueue(FAIL_JOB_QUEUE) private readonly failedQueue: Queue,
  ) {}

  async addMailJob(jobData: JobData) {
    try {
      const job = await this.mailQueue.add(jobData.type, jobData.data, {
        attempts: 3, // Retry the job up to 3 times
        // Exponential backoff strategy with an initial delay of 10 seconds
        backoff: { type: 'exponential', delay: 10000 },
      });
      this.logger.log(`Added job ${job.id} to ${MAIL_QUEUE} queue`);
    } catch (error) {
      this.logger.error(`Failed to add job. Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addGeoLogJob(job: GeoLogJob) {
    try {
      const addedJob = await this.geoLogQueue.add('geo-track', job, {
        attempts: 3, // Retry the job up to 3 times
        // Exponential backoff strategy with an initial delay of 5 seconds
        backoff: { type: 'exponential', delay: 5000 },
      });
      this.logger.log(`Added job ${addedJob.id} to ${GEO_LOGS_QUEUE} queue`);
    } catch (error) {
      this.logger.error(`Failed to add geo log job. Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addJobToFailedQueue(job: Job) {
    try {
      await this.failedQueue.add(job.name, job.data);
      this.logger.log(`Added job ${job.id} to ${FAIL_JOB_QUEUE} queue`);
    } catch (error) {
      this.logger.error(`Failed to add job to failed queue. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
