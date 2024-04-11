import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { TokenManageService } from './token-manage.service';
import { RtGuard } from '../../guard';
import { BlacklistRefreshTokensDto, RequestWithUserDto } from './dto';
import { blackListActionType } from './type';
import { Public } from '../../../common';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class TokenManageController {
  constructor(private tokenManageService: TokenManageService) {}
  @SkipThrottle()
  // @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh the tokens of the current user',
    description: `
    ** POST: http://localhost:3333/auth/refresh
     bearer token: {refresh token}
     }
     * It will return a new access token and refresh token.
     * `,
  })
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
      await this.tokenManageService.refreshToken(userId, refreshToken, res);
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

  @SkipThrottle()
  @Post('revoke')
  @ApiOperation({
    summary: 'Blacklist refresh tokens',
    description:
      '* POST: http://localhost:3333/auth/revoke?users=multiple\n' +
      '     {\n' +
      '     "emails": ["maitysubham4041@gmail.com", "razmaityofficial@gmail.com"]\n' +
      '     }\n' +
      '     * It will revoke specified users refresh tokens.\n' +
      '     * @param dto\n' +
      '     */\n' +
      '  /** POST: http://localhost:3333/auth/revoke?users=everyone\n' +
      '   * It will revoke all refresh tokens\n' +
      '   *',
  })
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
      await this.tokenManageService.blacklistRefreshTokens(dto.emails);
      return { message: 'Refresh tokens blacklisted successfully' };
    } else if (users === 'everyone') {
      await this.tokenManageService.blacklistAllRefreshTokens();
      return { message: 'All refresh tokens blacklisted successfully' };
    } else {
      throw new BadRequestException('Invalid query parameter');
    }
  }
}
