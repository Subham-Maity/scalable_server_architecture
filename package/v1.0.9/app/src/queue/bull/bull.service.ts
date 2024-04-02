import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JobData } from './types/job-data.i';
import { MAIL_QUEUE } from './constant';

@Injectable()
export class BullService {
  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
    @InjectQueue('failed_mail_jobs') private readonly failedMailQueue: Queue,
  ) {}

  async addJob(jobData: JobData) {
    try {
      await this.mailQueue.add(jobData.type, jobData.data);
    } catch (error) {
      Logger.error(`Failed to add job. Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addJobToFailedQueue(jobData: JobData) {
    try {
      await this.failedMailQueue.add(jobData.type, jobData.data);
    } catch (error) {
      Logger.error(`Failed to add job to failed queue. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
