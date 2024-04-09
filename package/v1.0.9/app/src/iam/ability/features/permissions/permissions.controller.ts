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
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
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
  @ApiOperation({ summary: 'Get all permissions' })
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
  async getPermissions() {
    try {
      return await this.permissionsService.getPermissions();
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
