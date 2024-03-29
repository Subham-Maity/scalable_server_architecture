import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailJob } from '../types/mail-jobs.i';

@Processor('failed_mail_jobs')
export class FailedMailJobsProcessor {
  private readonly logger = new Logger(FailedMailJobsProcessor.name);

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing failed job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.log(`Failed job ${job.id} has been processed. Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onError(job: Job, error: any) {
    this.logger.error(`Failed to process job ${job.id}. Error: ${error.message}`, error.stack);
  }

  @Process('mail')
  async processFailedMailJob(job: Job<MailJob>) {
    // Here you can handle the failed mail job. For example, you can log the job data:
    this.logger.error(
      `Failed to send mail for job ${job.id}. Job data: ${JSON.stringify(job.data)}`,
    );
  }
}
