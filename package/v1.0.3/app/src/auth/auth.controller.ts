import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { RtGuard } from './guard';
import { GetCurrentUser, GetCurrentUserId } from './decorator';
import { Public } from '../common/decorator';
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

@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
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
  signupLocal(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response): Promise<void> {
    return this.authService.signupLocal(dto, res);
  }

  /** POST: http://localhost:3333/auth/local/signin
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   }
   * @param dto
   * @param res
   */
  @Public()
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
  /** POST: http://localhost:3333/auth/refresh
   bearer token: {refresh token}
   }
   * It will return a new access token and refresh token.
   * @param userId
   * @param refreshToken
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
    @GetCurrentUserId() userId: ConfigId,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.authService.refreshToken(userId, refreshToken, res);
  }
}
