import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Mail0AuthService } from '../../../mail';
import { MailJob } from '../types/mail-jobs.i';
import { BullService } from '../bull.service';
import { MAIL_QUEUE } from '../constant';

@Processor(MAIL_QUEUE)
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private mail0AuthService: Mail0AuthService,
    private bullService: BullService,
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

    // move the failed job to the DLQ
    try {
      await this.bullService.addJobToFailedQueue({
        type: job.name,
        data: job.data,
      });
    } catch (error) {
      this.logger.error(`Failed to add job to failed queue. Error: ${error.message}`, error.stack);
    }
  }

  @Process('mail')
  async mailJob(job: Job<MailJob>) {
    try {
      const { email, subject, template, context } = job.data;
      await this.mail0AuthService.sendMail0Auth(email, subject, template, context);
      this.logger.log(`Mail sent successfully for job ${job.id}`);
      return 'Mail sent successfully';
    } catch (error) {
      this.logger.error(
        `Failed to send mail for job ${job.id}. Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
