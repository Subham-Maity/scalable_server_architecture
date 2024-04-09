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
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ConfigId } from '../../../../types';
import { CreateRoleDto, UpdateRoleNameDto } from './dto';
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
} from '@nestjs/swagger';

@ApiTags('®️ Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
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

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
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
  async getRoles() {
    try {
      return await this.rolesService.getRoles();
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
