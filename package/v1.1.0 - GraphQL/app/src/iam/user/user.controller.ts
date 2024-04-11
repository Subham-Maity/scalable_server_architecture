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
import { EditUserDto, GetAllUsersDto, UserIdDto, UserResponseDto } from './dto';
import { UserService } from './user.service';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PermissionGuard, PermissionListGuard, SuperAdminGuard } from '../ability/guard';
import { AtGuard, CheckDeletedUserGuard } from '../auth/guard';
import { GetCurrentUser, GetCurrentUserId } from '../auth/decorator';
@ApiTags('👤 User')
@UseGuards(AtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @SkipThrottle()
  @Get()
  @UseGuards(PermissionListGuard)
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all users',
    description: `
      This endpoint returns a list of all users. You can use various query parameters to filter, sort, and paginate the results.

      Query Parameters:
      - **page (number)**: The page number for pagination (default: 1)
      - **limit (number)**: The number of items per page for pagination (default: 10)
      - **sortBy (string)**: The field to sort by (e.g., createdAt, updatedAt, email, firstName, lastName)
      - **order (string)**: The order to sort by (asc or desc, default: asc)
      - **q (string)**: The search query to filter users by email, firstName, or lastName
      - **Any other field from the User model can be used for filtering**

      **Example Queries:**
      - Get all users: \`/users\`
      - Get users on page 2 with 20 items per page: \`/users?page=1&limit=1\`
      - Get users sorted by email in descending order: \`/users?sortBy=createdAt&order=desc\`
      - Search for users with email containing 'example': \`/users?q=raz\`
      - Filter users by firstName 'John': \`/users?id=660be4c6a7d2805486136973&email=maitysubham4041@gmail.com&firstName=Subham&lastName=Maity&deleted=false&roleId=6610344b2e5213cac073aff5&createdAt=2024-04-02T10:58:14.963Z&updatedAt=2024-04-10T10:26:56.348Z\`
      - Combine multiple parameters: \`/users?id=660be4c6a7d2805486136973&email=maitysubham4041@gmail.com&firstName=Subham&lastName=Maity&deleted=false&roleId=6610344b2e5213cac073aff5&createdAt=2024-04-02T10:58:14.963Z&updatedAt=2024-04-10T10:26:56.348Z&sortBy=createdAt&order=asc&q=maity&page=1&limit=1\`
    `,
  })
  @ApiOkResponse({
    status: 200,
    description: "The users' information has been successfully retrieved.",
    type: [UserResponseDto],
  })
  // @UseGuards(AdminGuard)
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiQuery({ type: GetAllUsersDto, name: 'filters', required: false })
  getAllUsers(@Query() dto: GetAllUsersDto) {
    try {
      return this.userService.getAllUsers(dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('An error occurred while retrieving the users.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }

  @SkipThrottle()
  @Get('me')
  @UseGuards(CheckDeletedUserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current user's information" })
  @ApiOkResponse({
    status: 200,
    description: "The user's information has been successfully retrieved.",
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiOperation({
    summary: "Get the current user's information",
    description: `
      This endpoint returns the current user's information.
      **Example:**
      - Get the user: \`http://localhost:3333/me\`
    `,
  })
  getUserById(@GetCurrentUser() user: UserIdDto) {
    try {
      return this.userService.getUserById(user.sub);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('An error occurred while retrieving the user information.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }

  /**

   */
  @SkipThrottle()
  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update the current user's information",
    description: `
   * PATCH: http://localhost:3333/users
   * bearer token: {access token}
   * It will update the current user's information.
   {
   "email": "maitysubham4041@gmail.com",
   "password": "subShams@52sss",
   "firstName": "Subham",
   "lastName": "Maity"
   }
  `,
  })
  @ApiOkResponse({
    status: 200,
    description: "The user's information has been successfully updated.",
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiBody({
    type: EditUserDto,
    description: 'The user information',
    schema: { example: { firstName: 'Subham', lastName: 'Maity' } },
  })
  editUser(@GetCurrentUserId() userId: UserIdDto, @Body() dto: EditUserDto) {
    try {
      return this.userService.editUser(userId, dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('An error occurred while updating the user information.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }

  @SkipThrottle()
  @Patch(':id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft delete a user by an admin',
    description: `
   * PATCH: http://localhost:3333/users/:id/delete
   * bearer token: {access token}
   * It will softly delete a user by an admin.
  `,
  })
  @ApiOkResponse({
    status: 200,
    description: "The user's account has been successfully marked as deleted.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  adminDelete(@Param('id') userId: UserIdDto) {
    try {
      return this.userService.userDelete(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('An error occurred while deleting the user account.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }

  @SkipThrottle()
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore a user by an admin',
    description: ` 
   * PATCH: http://localhost:3333/users/:id/restore
   * bearer token: {access token}
   * It will restore a user by an admin.`,
  })
  @ApiOkResponse({
    status: 200,
    description: "The user's account has been successfully restored.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  userBack(@Param('id') userId: UserIdDto) {
    try {
      return this.userService.userBack(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('An error occurred while restoring the user account.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }

  @SkipThrottle()
  @UseGuards(SuperAdminGuard)
  @Delete(':id/danger-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Hard delete a user by a super admin',
    description: `
   * DELETE: http://localhost:3333/users/:id/danger-delete
   * bearer token: {access token}
   * It will hard delete a user by a super admin.
   `,
  })
  @ApiOkResponse({
    status: 200,
    description: "The user's account has been successfully deleted.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  superAdminDelete(@Param('id') userId: UserIdDto) {
    try {
      return this.userService.dangerUserDelete(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('An error occurred while deleting the user account.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }
}
