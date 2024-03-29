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
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { EditUserDto, GetAllUsersDto } from './dto';
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
   *
   * Query Parameters:
   * - page (number): The page number for pagination (default: 1)
   * - limit (number): The number of items per page for pagination (default: 10)
   * - sortBy (string): The field to sort by (e.g., createdAt, updatedAt, email, firstName, lastName)
   * - order (string): The order to sort by (asc or desc, default: asc)
   * - q (string): The search query to filter users by email, firstName, or lastName
   * - any other field from the User model can be used for filtering
   *
   * Example queries:
   * - Get all users: http://localhost:3333/users
   * - Get users on page 2 with 20 items per page: http://localhost:3333/users?page=2&limit=20
   * - Get users sorted by email in descending order: http://localhost:3333/users?sortBy=email&order=desc
   * - Search for users with email containing 'example': http://localhost:3333/users?q=example
   * - Filter users by firstName 'John': http://localhost:3333/users?firstName=John
   * - Combine multiple parameters: http://localhost:3333/users?page=1&limit=10&sortBy=createdAt&order=desc&q=example&firstName=John
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    status: 200,
    description: "The users' information has been successfully retrieved.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  getAllUsers(@Query() dto: GetAllUsersDto) {
    return this.userService.getAllUsers(dto);
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
