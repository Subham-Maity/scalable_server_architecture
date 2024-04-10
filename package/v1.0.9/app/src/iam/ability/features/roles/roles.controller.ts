import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
  HttpException,
  HttpCode,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ConfigId } from '../../../../types';
import { CreateRoleDto, GetAllRolesDto, UpdateRoleNameDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('®️ Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @SkipThrottle()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto, description: 'The role data' })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'The role has been successfully created.',
    type: CreateRoleDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
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
    type: InternalServerErrorException,
  })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    try {
      return await this.rolesService.createRole(createRoleDto.name, createRoleDto.description);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @SkipThrottle()
  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: `
      This endpoint returns a list of all roles. You can use various query parameters to filter, sort, and paginate the results.

      Query Parameters:
      - **page (number)**: The page number for pagination (default: 1)
      - **limit (number)**: The number of items per page for pagination (default: 10)
      - **sortBy (string)**: The field to sort by (e.g., createdAt, updatedAt)
      - **order (string)**: The order to sort by (asc or desc, default: asc)
      - **q (string)**: The search query to filter users by name
      - **Any other field from the User model can be used for filtering**

      **Example Queries:**
      - Get all users: \`/roles\`
      - Get users on page 2 with 20 items per page: \`/roles?page=2&limit=20\`
      - Get users sorted by createdAt in descending order: \`/roles?sortBy=createdAt&order=desc\`
      - Search for users with roles containing 'example': \`/roles?q=in3\`
      - Filter role : \`/roles?name=TestAdmin3&description=Can%20do%20everything&createdAt=2024-04-10T11:06:44.879Z&updatedAt=2024-04-10T11:06:44.879Z\`
      - Combine multiple parameters: \`/roles?name=TestAdmin3&sortBy=createdAt&order=asc&q=dm&page=1&limit=1\`
    `,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page for pagination' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (asc/desc)' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({
    type: GetAllRolesDto,
    name: 'filters',
    required: false,
    description: 'Filter by role all',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The roles have been successfully retrieved.',
    type: [CreateRoleDto],
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async getRoles(@Query() dto: GetAllRolesDto) {
    try {
      return await this.rolesService.getRoles(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'The role ID', required: true })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The role has been successfully retrieved.',
    type: CreateRoleDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async getRoleById(@Param('id') id: ConfigId) {
    try {
      const role = await this.rolesService.getRoleById(id);
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }
      return role;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiParam({ name: 'id', description: 'The role ID', required: true })
  @ApiBody({ type: UpdateRoleNameDto, description: 'The new role data' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The role has been successfully updated.',
    type: UpdateRoleNameDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async updateRoleName(@Param('id') id: ConfigId, @Body() updateRoleNameDto: UpdateRoleNameDto) {
    try {
      return await this.rolesService.updateRoleName(
        id,
        updateRoleNameDto.name,
        updateRoleNameDto.description,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiParam({ name: 'id', description: 'The role ID', required: true })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The role has been successfully deleted.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async deleteRole(@Param('id') id: ConfigId) {
    try {
      return await this.rolesService.deleteRole(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
