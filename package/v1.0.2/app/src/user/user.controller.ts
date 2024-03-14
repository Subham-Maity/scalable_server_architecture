import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { AtGuard } from '../auth/guard';
import { GetCurrentUser, GetCurrentUserId } from '../auth/decorator';
import { ConfigId } from '../types';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('👤 User')
@UseGuards(AtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET: http://localhost:3333/users/me
   * bearer token: {access token}
   * It will return the current user's information.
   * @param user
   */
  @Get('me')
  @ApiOperation({ summary: "Get the current user's information" })
  @ApiOkResponse({
    status: 200,
    description: "The user's information has been successfully retrieved.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  getMe(@GetCurrentUser() user: User) {
    return user;
  }

  /**
   * PATCH: http://localhost:3333/users
   * bearer token: {access token}
   * It will update the current user's information.
   * @param userId
   * @param dto
   */
  @Patch()
  @ApiOperation({ summary: "Update the current user's information" })
  @ApiOkResponse({
    status: 200,
    description: "The user's information has been successfully updated.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiBody({
    type: EditUserDto,
    description: 'The user information',
    schema: { example: { firstName: 'Subham', lastName: 'Maity' } },
  })
  editUser(@GetCurrentUserId() userId: ConfigId, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
