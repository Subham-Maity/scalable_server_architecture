// logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
@Injectable()
export class LoggerService {
  private readonly logger = new Logger();
  logQuery(query: any, queryName: string) {
    if (query) {
      this.logger.debug(`${queryName} query is ${JSON.stringify(query)}`);
    } else {
      this.logger.error(`Not found this ${queryName} query`);
    }
  }
}
