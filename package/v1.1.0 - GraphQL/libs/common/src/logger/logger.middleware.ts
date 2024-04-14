import {
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: LoggerService;
  private requestNumber = 0;

  constructor() {
    this.logger = new Logger('HTTP');
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = uuidv4();
    this.requestNumber++;
    const { ip, method, originalUrl, headers, body, protocol } = request;
    const userAgent = request.get('user-agent') || '';

    this.logger.log(
      `[${requestId}][#${this.requestNumber}] ${method} ${originalUrl} - ${userAgent} ${ip} - ${protocol}`,
      LoggerMiddleware.name,
    );
    this.logger.debug(
      `[${requestId}][#${this.requestNumber}] Headers: ${JSON.stringify(headers)}`,
      LoggerMiddleware.name,
    );
    this.logger.debug(
      `[${requestId}][#${this.requestNumber}] Body: ${JSON.stringify(body)}`,
      LoggerMiddleware.name,
    );

    const start = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const end = Date.now();
      const latency = end - start;

      this.logger.log(
        `[${requestId}][#${this.requestNumber}] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${latency}ms`,
        LoggerMiddleware.name,
      );
    });

    next();
  }
}
