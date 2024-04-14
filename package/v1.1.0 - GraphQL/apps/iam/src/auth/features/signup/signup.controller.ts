import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { SignupService } from './signup.service';

import { CheckUniqueEmailGuard } from '../../guard';
import { SignupDto } from './dto';
import { Public } from '../../../common';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 2, ttl: 120000 } })
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Signup a user' })
  @ApiBody({ type: SignupDto, description: 'The user information' })
  @ApiOperation({
    summary: 'Sign up a new user',
    description: `
     1. The user enters their email address, password, first name, and last name on the registration page of the application
     and clicks on the “Sign Up” button. The application sends a POST request to /auth/local/signup with
     the user’s information in the request body.
     2. The server generates a verification token and a verification link that includes the token. The link is sent to the user’s email.
     3. The user clicks on the verification link in their email. The application sends a GET request to /auth/verify-account/:token
     with the token from the url.
     4. After the user’s account is activated, the server sends a confirmation email to the user.
    `,
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @UseGuards(CheckUniqueEmailGuard)
  async signupLocal(@Body() dto: SignupDto): Promise<{ message: string }> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Invalid data.');
    }
    try {
      await this.signupService.signupLocal(dto);
      return {
        message: `User ${dto.email} created successfully`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('verify-account/:token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Verify account and create a new account',
    description: `
     GET: http://localhost:3333/auth/verify-account/:token

     http://localhost:3333/auth/verify-account/eyJlbWFpbCI6InVzZWx...`,
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiBadRequestResponse({
    status: 401,
    description: 'Unauthorized request for verification .',
  })
  async verifyAccount(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException(
        'The token is required for verification purposes.',
      );
    }
    try {
      await this.signupService.activateUser(token, res);
      return {
        message: 'Account activated successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
