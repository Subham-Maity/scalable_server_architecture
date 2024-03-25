import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { AtGuard, CheckDeletedUserGuard } from '../auth/guard';
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
   * GET: http://localhost:3333/users
   * bearer token: {access token}
   * It will return all users' information.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    status: 200,
    description: "The users' information has been successfully retrieved.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  /**
   * GET: http://localhost:3333/users/me
   * bearer token: {access token}
   * It will return the current user's information.
   * @param user
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current user's information" })
  @ApiOkResponse({
    status: 200,
    description: "The user's information has been successfully retrieved.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @UseGuards(CheckDeletedUserGuard)
  getUserById(@GetCurrentUser() user: User) {
    return this.userService.getUserById(user.email);
  }

  /**
   * PATCH: http://localhost:3333/users
   * bearer token: {access token}
   * It will update the current user's information.
   * @param userId
   * @param dto
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
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

  /**
   * PATCH: http://localhost:3333/users/:id/delete
   * bearer token: {access token}
   * It will soft delete a user by an admin.
   * @param userId
   */
  @Patch(':id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a user by an admin' })
  @ApiOkResponse({
    status: 200,
    description: "The user's account has been successfully marked as deleted.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  adminDelete(@Param('id') userId: ConfigId) {
    return this.userService.userDelete(userId);
  }
  /**
   * PATCH: http://localhost:3333/users/:id/restore
   * bearer token: {access token}
   * It will restore a user by an admin.
   * @param userId
   */
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a user by an admin' })
  @ApiOkResponse({
    status: 200,
    description: "The user's account has been successfully restored.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  userBack(@Param('id') userId: ConfigId) {
    return this.userService.userBack(userId);
  }
  /**
   * DELETE: http://localhost:3333/users/:id/danger-delete
   * bearer token: {access token}
   * It will hard delete a user by a super admin.
   * @param userId
   */
  @Delete(':id/danger-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete a user by a super admin' })
  @ApiOkResponse({
    status: 200,
    description: "The user's account has been successfully deleted.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  superAdminDelete(@Param('id') userId: ConfigId) {
    return this.userService.dangerUserDelete(userId);
  }
}
