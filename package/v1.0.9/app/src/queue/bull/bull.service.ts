import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JobData } from './types/job-data.i';
import { FAIL_JOB_QUEUE, GEO_LOGS_QUEUE, MAIL_QUEUE } from './constant';
import { GeoLogJob } from './types/geo-logs.i';

@Injectable()
export class BullService {
  private readonly logger = new Logger(BullService.name);
  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
    @InjectQueue(GEO_LOGS_QUEUE) private readonly geoLogQueue: Queue,
    @InjectQueue(FAIL_JOB_QUEUE) private readonly failedMailQueue: Queue,
  ) {}

  async addJob(jobData: JobData) {
    try {
      await this.mailQueue.add(jobData.type, jobData.data);
    } catch (error) {
      this.logger.error(`Failed to add job. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
  async addGeoLogJob(job: GeoLogJob) {
    try {
      await this.geoLogQueue.add('geo-track', job);
    } catch (error) {
      this.logger.error(`Failed to add geo log job. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
  async addJobToFailedQueue(jobData: JobData) {
    try {
      await this.failedMailQueue.add(jobData.type, jobData.data);
    } catch (error) {
      this.logger.error(`Failed to add job to failed queue. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
