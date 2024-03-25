import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { CheckUniqueEmailGuard, CheckUserExistsGuard, RtGuard } from './guard';
import { GetCurrentUserId } from './decorator';
import { Public } from '../common';
import { ConfigId } from '../types';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './type';
import { Response } from 'express';

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
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   "firstName": "Subham",
   "lastName": "Maity",
   }
   * @param dto
   * @param res
   */
  @Public()
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiBody({ type: AuthDto, description: 'The user information' })
  @UseGuards(CheckUniqueEmailGuard)
  signupLocal(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response): Promise<void> {
    return this.authService.signupLocal(dto, res);
  }

  /** GET: http://localhost:3333/auth/verify-account/:token
   * @param token
   * @param res
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Get('verify-account/:token')
  verifyAccount(@Param('token') token: string, @Res() res: Response) {
    return this.authService.activateUser(token, res);
  }
  /*--------------------------*/
  /**���������LOGIN���������*/
  /*_________________________*/

  /** POST: http://localhost:3333/auth/local/signin
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   }
   * @param dto
   * @param res
   */
  @Public()
  @UseGuards(CheckUserExistsGuard)
  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed in.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiUnauthorizedResponse({ status: 403, description: 'Unauthorized: Password does not match.' })
  @ApiBody({ type: AuthDto, description: 'The user credentials' })
  signinLocal(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response): Promise<void> {
    return this.authService.signinLocal(dto, res);
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
  @Post('/local/signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed out.',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  logout(
    @GetCurrentUserId() userId: ConfigId,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.authService.signoutLocal(userId, res);
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
   * @param email
   */
  @Public()
  @UseGuards(CheckUserExistsGuard)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiCreatedResponse({
    status: 200,
    description: 'Password reset link has been sent.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid email.' })
  forgotPassword(@Body('email') email: string) {
    return this.authService.resetPasswordRequest(email);
  }
  /**
   * POST: http://localhost:3333/auth/verify-otp
   * It will verify the OTP.
   * @param code
   * @param token
   * @param res
   */
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiOkResponse({ status: 200, description: 'The OTP has been successfully verified.' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  verifyOTP(@Body('code') code: string, @Body('token') token: string, @Res() res: Response) {
    return this.authService.verifyOTP(code, token, res);
  }

  /**
   * PATCH: http://localhost:3333/auth/reset-password
   * It will reset the password of the user.
   * @param dto
   * @param token
   * @param res
   */
  @Public()
  @Patch('reset-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reset the password of the user' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The password has been successfully reset.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiBody({ type: AuthDto, description: 'The user information' })
  resetPassword(@Body() dto: AuthDto, @Body('token') token: string, @Res() res: Response) {
    return this.authService.resetPassword(dto, token, res);
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
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the tokens of the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The tokens have been successfully refreshed.',
    type: 'application/text',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  refreshTokens(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshToken(userId, refreshToken, res);
  }

  /*-----------------------------*/
  /**���������CHECK AUTH���������*/
  /*__________________________*/

  /** POST: http://localhost:3333/auth/check
   bearer token: {access token}
   }
   * It will return a new access token and refresh token.
   * @param req
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: ' Check the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user id has been successfully checked.',
    type: 'application/text',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized : No token provided.' })
  checkUser(@Request() req: RequestWithUser) {
    return this.authService.checkUser(req);
  }
}
