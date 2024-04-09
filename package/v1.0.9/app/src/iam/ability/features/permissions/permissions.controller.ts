import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpCode,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Delete,
  Put,
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
    return this.permissionsService.createPermission(
      createPermissionDto.name,
      createPermissionDto.action,
    );
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
    return this.permissionsService.getPermissions();
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
    const permission = await this.permissionsService.getPermissionById(params);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${params.id} not found.`);
    }
    return permission;
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
    return this.permissionsService.updatePermissionById(params, updatePermissionDto);
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
    return this.permissionsService.deletePermissionById(params);
  }
}
