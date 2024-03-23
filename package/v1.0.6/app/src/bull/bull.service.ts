import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { MAIL_QUEUE } from '../constants';
import { Queue } from 'bull';
import { JobData } from './types/job-data.i';

//Responsible for queuing jobs

@Injectable()
export class BullService {
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  async addJob(jobData: JobData) {
    try {
      await this.mailQueue.add(jobData.type, jobData.data);
    } catch (error) {
      Logger.error(`Failed to add job. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
