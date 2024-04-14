import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof PrismaClientKnownRequestError
          ? this.handlePrismaError(exception)
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = this.handleErrorResponse(exception, status, request);

    // Log the error using NestJS logger
    this.logger.error(errorResponse.message, errorResponse.metadata);

    if (host.getType() === 'http') {
      response.status(status).json(this.serializeErrorResponse(errorResponse));
    } else {
      return this.handleGraphQLException(exception, errorResponse);
    }
  }

  private handleGraphQLException(
    exception: unknown,
    errorResponse: ErrorResponse,
  ): ApolloError {
    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      errorMessage = exception.message;
      errorCode = 'HTTP_EXCEPTION';
    } else if (exception instanceof PrismaClientKnownRequestError) {
      errorMessage = exception.message;
      errorCode = 'PRISMA_ERROR';
    }

    const apolloError = new ApolloError(errorMessage, errorCode, {
      metadata: this.isProduction ? undefined : errorResponse.metadata,
    });

    if (exception instanceof Error) {
      this.logger.error(errorMessage, exception.stack);
    } else {
      this.logger.error(errorMessage);
    }

    return apolloError;
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): number {
    if (error.code === 'P2002') {
      return HttpStatus.CONFLICT;
    }
    // handle other Prisma errors
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private handleErrorResponse(
    exception: unknown,
    status: HttpStatus,
    request: any,
  ): ErrorResponse {
    let message: string;
    let errorCode: string;
    let metadata: Record<string, any> = {};

    if (exception instanceof HttpException) {
      message = exception.message || 'An error occurred';
      errorCode = exception.getResponse()['errorCode'] || 'HTTP_EXCEPTION';
      const exceptionResponse = exception.getResponse();
      metadata = typeof exceptionResponse === 'object' ? exceptionResponse : {};
    } else if (exception instanceof PrismaClientKnownRequestError) {
      message = exception.message;
      errorCode = 'PRISMA_ERROR';
      metadata = { prismaErrorCode: exception.code };
    } else if (exception instanceof BadRequestException) {
      message = 'Validation error';
      errorCode = 'VALIDATION_ERROR';
      const exceptionResponse = exception.getResponse();
      metadata = typeof exceptionResponse === 'object' ? exceptionResponse : {};
    } else {
      message = 'Internal server error';
      errorCode = 'INTERNAL_SERVER_ERROR';
    }

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errorCode,
      metadata,
    };
  }

  private serializeErrorResponse(errorResponse: ErrorResponse) {
    if (this.isProduction) {
      // In production, sanitize the error response to avoid exposing sensitive information
      return {
        statusCode: errorResponse.statusCode,
        message: errorResponse.message,
        errorCode: errorResponse.errorCode,
      };
    } else {
      // In development or staging, return the full error response
      return errorResponse;
    }
  }
}

interface ErrorResponse {
  statusCode: HttpStatus;
  timestamp: string;
  path: string;
  message: string;
  errorCode: string;
  metadata?: Record<string, any>;
}
