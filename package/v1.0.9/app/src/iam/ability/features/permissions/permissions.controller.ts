import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpCode,
  NotFoundException,
  Delete,
  Put,
  HttpException,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, GetAllPermissionsDto, UpdatePermissionDto } from './dto';
import { UserIdDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('🪪 Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto, description: 'The permission data' })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'The permission has been successfully created.',
    type: CreatePermissionDto,
  })
  @ApiOkResponse({
    status: 200,
    description: "The users' information has been successfully retrieved.",
    type: [CreatePermissionDto],
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    try {
      return await this.permissionsService.createPermission(
        createPermissionDto.name,
        createPermissionDto.action,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all permission',
    description: `
      This endpoint returns a list of all permission. You can use various query parameters to filter, sort, and paginate the results.

      Query Parameters:
      - **page (number)**: The page number for pagination (default: 1)
      - **limit (number)**: The number of items per page for pagination (default: 10)
      - **sortBy (string)**: The field to sort by (e.g., createdAt, updatedAt)
      - **order (string)**: The order to sort by (asc or desc, default: asc)
      - **q (string)**: The search query to filter users by name
      - **Any other field from the User model can be used for filtering**

      **Example Queries:**
      - Get all users: \`/permissions\`
      - Get users on page 2 with 20 items per page: \`/permissions?page=2&limit=20\`
      - Get users sorted by createdAt in descending order: \`/permissions?sortBy=createdAt&order=asc\`
      - Search for users with permissions containing 'example': \`/permissions?q=y1\`
      - Filter permissions : \`/permissions?name=Any1sss&action=Any1&createdAt=2024-04-10T10:36:57.179Z&updatedAt=2024-04-10T10:36:57.179Z\`
      - Combine multiple parameters: \`/permissions?page=1&limit=10&sortBy=name&order=asc&q=Any1&name=Any1sss&action=Any1&createdAt=2024-04-10T10:36:57.179Z&updatedAt=2024-04-10T10:36:57.179Z\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The permissions have been successfully retrieved.',
    type: [CreatePermissionDto],
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page for pagination' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (asc/desc)' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({
    type: GetAllPermissionsDto,
    name: 'filters',
    required: false,
    description: 'Filter by role all',
  })
  async getPermissions(@Query() dto: GetAllPermissionsDto) {
    try {
      return await this.permissionsService.getPermissions(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', description: 'The permission ID', required: true })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The permission has been successfully retrieved.',
    type: CreatePermissionDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async getPermissionById(@Param() params: UserIdDto) {
    try {
      const permission = await this.permissionsService.getPermissionById(params);
      if (!permission) {
        throw new NotFoundException(`Permission with ID ${params.id} not found.`);
      }
      return permission;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a permission by ID' })
  @ApiParam({ name: 'id', description: 'The permission ID', required: true })
  @ApiBody({ type: UpdatePermissionDto, description: 'The new permission data' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The permission has been successfully updated.',
    type: UpdatePermissionDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async updatePermissionById(
    @Param() params: UserIdDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      return await this.permissionsService.updatePermissionById(params, updatePermissionDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a permission by ID' })
  @ApiParam({ name: 'id', description: 'The permission ID', required: true })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The permission has been successfully deleted.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async deletePermissionById(@Param() params: UserIdDto) {
    try {
      return await this.permissionsService.deletePermissionById(params);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
