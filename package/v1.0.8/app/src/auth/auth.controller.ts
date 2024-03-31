import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthDto,
  BlacklistRefreshTokensDto,
  ChangePasswordDto,
  ForgetPasswordDto,
  LogoutDto,
  RequestTypeDto,
  RequestWithUserDto,
  ResetPasswordDto,
  VerifyAccountDto,
  VerifyOtpDto,
} from './dto';
import { CheckUniqueEmailGuard, CheckUserExistsGuard, RtGuard } from './guard';
import { GetCurrentUserId } from './decorator';
import { Public } from '../common';
import { ConfigId } from '../types';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { blackListActionType } from './type';
import { Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /*--------------------------*/
  /**���������REGISTER���������*/
  /*_________________________*/
  /**
   1. The user enters their email address, password, first name, and last name on the registration page of the application
   and clicks on the “Sign Up” button. The application sends a POST request to /auth/local/signup with
   the user’s information in the request body.
   2. The server generates a verification token and a verification link that includes the token. The link is sent to the user’s email.
   3. The user clicks on the verification link in their email. The application sends a GET request to /auth/verify-account/:token
   with the token from the url.
   4. After the user’s account is activated, the server sends a confirmation email to the user.
   */

  /** POST: http://localhost:3333/auth/local/signin
       {
       "email": "subham@gmail.com",
       "password": "Codexam@123",
       }
   * @param dto
   */
  @Public()
  @Throttle({ default: { limit: 2, ttl: 120000 } })
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiBody({ type: AuthDto, description: 'The user information' })
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
  async signupLocal(@Body() dto: AuthDto): Promise<{ message: string }> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Invalid data.');
    }
    try {
      await this.authService.signupLocal(dto);
      return {
        message: `User ${dto.email} created successfully`,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while creating the user.');
      }
    }
  }

  /** GET: http://localhost:3333/auth/verify-account/:token

   http://localhost:3333/auth/verify-account/eyJlbWFpbCI6InVzZWx...

   * @param token
   * @param res
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('verify-account/:token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Verify account and create a new account' })
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
  @ApiBadRequestResponse({ status: 401, description: 'Unauthorized request for verification .' })
  async verifyAccount(
    @Param('token') token: VerifyAccountDto,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('The token is required for verification purposes.');
    }
    try {
      await this.authService.activateUser(token, res);
      return {
        message: 'Account activated successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while verifying the user account.',
        );
      }
    }
  }
  /*--------------------------*/
  /**���������LOGIN���������*/
  /*_________________________*/

  /** POST: http://localhost:3333/auth/local/signin
   {
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   }
   * @param dto
   * @param res
   */
  @Public()
  @Throttle({ default: { limit: 8, ttl: 120000 } })
  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiBody({ type: AuthDto, description: 'The user credentials' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({
    status: 403,
    description: 'Unauthorized: Password does not match.',
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
  @UseGuards(CheckUserExistsGuard)
  async signinLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Invalid data.');
    }
    try {
      await this.authService.signinLocal(dto, res);
      return { message: `${dto.email} login successful` };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while signing in the user.');
      }
    }
  }

  /*--------------------------*/
  /**���������LOGOUT���������*/
  /*_________________________*/

  /** POST: http://localhost:3333/auth/local/signout
   bearer token: {access token}
   }
   * It will set the `refreshTokenHash` to null in the database.
   * @param userId
   * @param res
   */
  @SkipThrottle()
  @Post('/local/signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed out.',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async logout(
    @GetCurrentUserId() userId: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('Invalid user ID.');
      }
      await this.authService.signoutLocal(userId, res);
      return { message: 'User signed out successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while signing out the user.');
      }
    }
  }

  /*-----------------------------------*/
  /**���������RESET PASSWORD���������*/
  /*_______________________________*/

  /** Flow of Password Reset:
   1. User enters their email address on the password reset page of your application and
   clicks on the "Reset Password" button.
   Your application sends a POST request to `/auth/forgot-password` with the user's email in the request body.

   2. Server generates an OTP and a password reset link that includes a JWT token.
   The JWT token contains the user's email and ID. The server sends the OTP and the reset link to the user's email.

   3. The user checks their email, finds the OTP, and enters it on the password reset page of the application.
   The application stores the JWT token from the reset link.

   4. Application sends a POST request to `/auth/verify-otp`
   with the OTP and the stored JWT token in the request body.

   5. The server verifies the OTP and the JWT token.
   If they are valid, the server returns the user's email and the JWT token in the response.
   Need to store the JWT token and the user's email in the application's state.

   6. The user enters their new password on the password reset page of the application.

   7.The application sends a PATCH request to `/auth/reset-password` with the new password,
   the user's email, and the stored JWT token from the state in the request body.

   8.The server resets the user's password and returns a confirmation message.
   */
  /**
   * POST: http://localhost:3333/auth/forgot-password
   * It will generate a password reset link for the user also send an OTP to the user.
   *
       {
       "email": "subham@gmail.com",
       }
   *
   * @param dto - The email of the user
   */

  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 2, ttl: 300000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
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
  async forgotPassword(@Body() dto: ForgetPasswordDto): Promise<{ message: string }> {
    try {
      if (!dto.email) {
        throw new BadRequestException('Email is required.');
      }
      await this.authService.resetPasswordRequest(dto.email);
      return { message: 'Password reset link has been sent' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while requesting password reset.',
        );
      }
    }
  }
  /**
   * POST: http://localhost:3333/auth/verify-otp
   * It will verify the OTP.
   {
   "code": "335626",
   "token": "eyJhbGci…"
   }
   *
   * @param dto
   * @param res
   */
  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiOkResponse({ status: 200, description: 'The OTP has been successfully verified.' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized.', type: Error })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden: Session expired.', type: Error })
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
  async verifyOTP(@Body() dto: VerifyOtpDto, @Res() res: Response): Promise<{ message: string }> {
    try {
      await this.authService.verifyOTP(dto.code, dto.token, res);
      return { message: 'OTP verified successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw error;
      }
    }
  }

  /**
   * PATCH: http://localhost:3333/auth/reset-password
   * It will reset the password of the user.
   {
   "email": "user@example.com",
   "password": "NewPassword123!",
   "token": "eyJhbGci..."
   }
   * @param dto
   * @param res
   */

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch('reset-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reset the password of the user' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The password has been successfully reset.',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.', type: Error })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized.', type: Error })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden: Session expired.', type: Error })
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
  @ApiBody({ type: ResetPasswordDto, description: 'The reset password information' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    if (!dto.email || !dto.password || !dto.token) {
      throw new BadRequestException('Email, password, and token are required.');
    }
    try {
      await this.authService.resetPassword(dto.email, dto.password, dto.token, res);
      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw error;
      }
    }
  }

  /**
   * PATCH: http://localhost:3333/auth/change-password
   * It will change the password of the current user.
   *
   * Request:
   *  Headers:
   *    Authorization: Bearer {access_token}
   {
   "oldPassword": "Password565@44",
   "newPassword": "NewPassword123!"
   }
   *
   * @param userId - The ID of the current user
   * @param dto - The change password information (old and new password)
   */
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change the password of the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The password has been successfully changed.',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
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
        throw new BadRequestException('User ID, old password, and new password are required.');
      }
      await this.authService.changePassword(userId, dto.oldPassword, dto.newPassword);
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

  /*-----------------------------*/
  /**���������NEW TOKEN���������*/
  /*__________________________*/

  /** POST: http://localhost:3333/auth/refresh
   bearer token: {refresh token}
   }
   * It will return a new access token and refresh token.
   * @param req
   * @param res
   */

  //if we don't use public decorator,
  //then it will ask for AtGuard instead of RtGuard
  //Purpose: @Public() here - bypass the access token check
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the tokens of the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The tokens have been successfully refreshed.',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden: Invalid refresh token.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async refreshTokens(
    @Req() req: RequestWithUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    try {
      const userId = req.user.sub;
      const refreshToken = req.user.refreshToken;
      await this.authService.refreshToken(userId, refreshToken, res);
      return Promise.resolve('Tokens refreshed successfully');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw error;
      }
    }
  }
  /*-----------------------------*/
  /**���������BLACKLIST TOKEN���������*/
  /*__________________________*/

  /** POST: http://localhost:3333/auth/revoke?users=multiple
   {
   "emails": ["maitysubham4041@gmail.com", "razmaityofficial@gmail.com"]
   }
   * It will revoke specified users refresh tokens.
   * @param dto
   */
  /** POST: http://localhost:3333/auth/revoke?users=everyone
   * It will revoke all refresh tokens
   */
  @SkipThrottle()
  @Post('revoke')
  @ApiOperation({ summary: 'Blacklist refresh tokens' })
  @ApiQuery({ name: 'users', required: true, enum: ['multiple', 'everyone'] })
  @ApiBody({ type: BlacklistRefreshTokensDto })
  @ApiOkResponse({ status: 200, description: 'Refresh tokens blacklisted successfully.' })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized - No token provided or invalid token.',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  // @UseGuards(AuthGuard('admin'))
  async blacklistRefreshTokens(
    @Body() dto: BlacklistRefreshTokensDto,
    @Query('users') users: blackListActionType,
  ): Promise<{ message: string }> {
    if (users === 'multiple') {
      if (!dto.emails) {
        throw new BadRequestException('Emails are required when blacklisting multiple users.');
      }
      await this.authService.blacklistRefreshTokens(dto.emails);
      return { message: 'Refresh tokens blacklisted successfully' };
    } else if (users === 'everyone') {
      await this.authService.blacklistAllRefreshTokens();
      return { message: 'All refresh tokens blacklisted successfully' };
    } else {
      throw new BadRequestException('Invalid query parameter');
    }
  }
  /*-----------------------------*/
  /**���������CHECK AUTH���������*/
  /*__________________________*/

  /** POST: http://localhost:3333/auth/check
   bearer token: {access token}
   }
   * Check the current user and return the user id.
   * @param req
   */
  @SkipThrottle()
  @Get('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: ' Check the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user id has been successfully checked.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized : No token provided.',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @UseGuards(AuthGuard('jwt'))
  checkUser(@Request() req: RequestTypeDto) {
    try {
      return this.authService.checkUser(req);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while checking the user.');
      }
    }
  }
}
