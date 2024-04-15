import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PasswordService } from './password.service';
import { CheckUserExistsGuard } from '../../guard';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto';
import { GetCurrentUserId } from '../../decorator';
import { Public } from '../../../common';
import { ConfigId } from '../../../common/type';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 2, ttl: 300000 } })
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      '/** Flow of Password Reset:\n' +
      '     1. User enters their email address on the password reset page of your application and\n' +
      '     clicks on the "Reset Password" button.\n' +
      "     Your application sends a POST request to `/auth/forgot-password` with the user's email in the request body.\n" +
      '\n' +
      '     2. Server generates an OTP and a password reset link that includes a JWT token.\n' +
      "     The JWT token contains the user's email and ID. The server sends the OTP and the reset link to the user's email.\n" +
      '\n' +
      '     3. The user checks their email, finds the OTP, and enters it on the password reset page of the application.\n' +
      '     The application stores the JWT token from the reset link.\n' +
      '\n' +
      '     4. Application sends a POST request to `/auth/verify-otp`\n' +
      '     with the OTP and the stored JWT token in the request body.\n' +
      '\n' +
      '     5. The server verifies the OTP and the JWT token.\n' +
      "     If they are valid, the server returns the user's email and the JWT token in the response.\n" +
      "     Need to store the JWT token and the user's email in the application's state.\n" +
      '\n' +
      '     6. The user enters their new password on the password reset page of the application.\n' +
      '\n' +
      '     7.The application sends a PATCH request to `/auth/reset-password` with the new password,\n' +
      "     the user's email, and the stored JWT token from the state in the request body.\n" +
      '\n' +
      "     8.The server resets the user's password and returns a confirmation message.\n" +
      '     */',
  })
  @ApiCreatedResponse({
    status: 200,
    description: 'Password reset link has been sent.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request: Invalid email.',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @UseGuards(CheckUserExistsGuard)
  async forgotPassword(
    @Body() dto: ForgetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      if (!dto.email) {
        throw new BadRequestException('Email is required.');
      }
      await this.passwordService.resetPasswordRequest(dto.email);
      return { message: 'Password reset link has been sent' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while requesting password reset.',
        );
      }
    }
  }

  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description: `* POST: http://localhost:3333/auth/verify-otp
     * It will verify the OTP.
     {
     "code": "335626",
     "token": "eyJhbGci…"
     }`,
  })
  @ApiOkResponse({
    status: 200,
    description: 'The OTP has been successfully verified.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request: Invalid data.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized.',
    type: Error,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden: Session expired.',
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
  async verifyOTP(
    @Body() dto: VerifyOtpDto,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    try {
      await this.passwordService.verifyOTP(dto.code, dto.token, res);
      return { message: 'OTP verified successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw error;
      }
    }
  }

  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch('reset-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reset the password of the user',
    description:
      ' * PATCH: http://localhost:3333/auth/reset-password\n' +
      '* It will reset the password of the user.\n' +
      '{\n"email": "user@example.com",' +
      '\n "password": "NewPassword123!",' +
      '\n "token": "eyJhbGci..."\n}',
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'The password has been successfully reset.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request: Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized.',
    type: Error,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden: Session expired.',
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
  @ApiBody({
    type: ResetPasswordDto,
    description: 'The reset password information',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    if (!dto.email || !dto.password || !dto.token) {
      throw new BadRequestException('Email, password, and token are required.');
    }
    try {
      await this.passwordService.resetPassword(
        dto.email,
        dto.password,
        dto.token,
        res,
      );
      return { message: 'Password reset successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw error;
      }
    }
  }

  @SkipThrottle()
  // @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change the password of the current user',
    description: `* PATCH: http://localhost:3333/auth/change-password
     * It will change the password of the current user.
     *
     * Request:
     *  Headers:
     *    Authorization: Bearer {access_token}
     {
     "oldPassword": "Password565@44",
     "newPassword": "NewPassword123!"
     }`,
  })
  @ApiOkResponse({
    status: 200,
    description: 'The password has been successfully changed.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request: Invalid data.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized: No token provided.',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiBody({ type: ChangePasswordDto, description: 'The user information' })
  async changePassword(
    @GetCurrentUserId() userId: ConfigId,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      if (!userId || !dto.oldPassword || !dto.newPassword) {
        throw new BadRequestException(
          'User ID, old password, and new password are required.',
        );
      }
      await this.passwordService.changePassword(
        userId,
        dto.oldPassword,
        dto.newPassword,
      );
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else throw error;
    }
  }
}
