import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Put,
  HttpStatus,
  HttpException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import { PermissionsService } from '../permissions/permissions.service';
import {
  AssignPermissionsDto,
  CreateRoleDto,
  RemovePermissionsDto,
  UpdatePermissionsDto,
  UpdateRoleNameDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RelationsService } from './relations.service';
import { AdminGuard } from '../../guard';
import { ConfigId } from '../../../common/type';

@ApiTags('💝 Relations')
@Controller('relations')
export class RelationsController {
  constructor(
    private readonly relationsService: RelationsService,
    private readonly permissionsService: PermissionsService,
  ) {}
  @UseGuards(AdminGuard)
  @Patch('permissions-to/:roleId')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({ name: 'roleId', description: 'The role ID', required: true })
  @ApiBody({
    type: AssignPermissionsDto,
    description: 'The permissions to assign',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The permissions have been successfully assigned to the role.',
    type: CreateRoleDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized: No token provided.',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async assignPermissionsToRole(
    @Param('roleId') roleId: ConfigId,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    try {
      const permissions = await this.permissionsService.getPermissionsByNames(
        assignPermissionsDto.permissions,
      );
      if (permissions.length === 0) {
        throw new NotFoundException('No permissions found.');
      }
      if (permissions.length !== assignPermissionsDto.permissions.length) {
        throw new NotFoundException('One or more permissions not found.');
      }
      const permissionIds = permissions.map(
        (permission: { id: string }) => permission.id,
      );
      return await this.relationsService.assignPermissionsToRole(
        roleId,
        permissionIds,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @UseGuards(AdminGuard)
  @Put('permissions-to/:roleId')
  @ApiOperation({ summary: 'Update permissions for a role' })
  @ApiParam({ name: 'roleId', description: 'The role ID', required: true })
  @ApiBody({ type: UpdatePermissionsDto, description: 'The new permissions' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The permissions have been successfully updated for the role.',
    type: UpdateRoleNameDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized: No token provided.',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async updatePermissionsForRole(
    @Param('roleId') roleId: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ) {
    try {
      const permissions = await this.permissionsService.getPermissionsByNames(
        updatePermissionsDto.permissions,
      );
      if (permissions.length === 0) {
        throw new NotFoundException('No permissions found.');
      }
      if (permissions.length !== updatePermissionsDto.permissions.length) {
        throw new NotFoundException('One or more permissions not found.');
      }
      const permissionIds = permissions.map(
        (permission: { id: string }) => permission.id,
      );
      return await this.relationsService.updatePermissionsForRole(
        roleId,
        permissionIds,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @UseGuards(AdminGuard)
  @Delete('permissions-to/:roleId')
  @ApiOperation({ summary: 'Remove permissions from a role' })
  @ApiParam({ name: 'roleId', description: 'The role ID', required: true })
  @ApiBody({
    type: RemovePermissionsDto,
    description: 'The permissions to remove',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description:
      'The permissions have been successfully removed from the role.',
    type: CreateRoleDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized: No token provided.',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'INTERNAL_SERVER_ERROR.',
    type: InternalServerErrorException,
  })
  async removePermissionsFromRole(
    @Param('roleId') roleId: string,
    @Body() removePermissionsDto: RemovePermissionsDto,
  ) {
    try {
      const permissions = await this.permissionsService.getPermissionsByNames(
        removePermissionsDto.permissions,
      );
      if (permissions.length === 0) {
        throw new NotFoundException('No permissions found.');
      }
      if (permissions.length !== removePermissionsDto.permissions.length) {
        throw new NotFoundException('One or more permissions not found.');
      }
      const permissionIds = permissions.map(
        (permission: { id: string }) => permission.id,
      );
      return await this.relationsService.removePermissionsFromRole(
        roleId,
        permissionIds,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
