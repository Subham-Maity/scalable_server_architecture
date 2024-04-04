import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  AssignPermissionsDto,
  CreateRoleDto,
  RemovePermissionsDto,
  UpdatePermissionsDto,
  UpdateRoleNameDto,
} from '../dto';
import { ConfigId } from '../../types';
import { PermissionsService } from '../permissions';
import { PrismaService } from '../../prisma';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto.name, createRoleDto.description);
  }

  @Get()
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Get(':id')
  getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Put(':id')
  updateRoleName(@Param('id') id: ConfigId, @Body() updateRoleNameDto: UpdateRoleNameDto) {
    return this.rolesService.updateRoleName(
      id,
      updateRoleNameDto.name,
      updateRoleNameDto.description,
    );
  }

  @Delete(':id')
  deleteRole(@Param('id') id: ConfigId) {
    return this.rolesService.deleteRole(id);
  }

  @Patch(':roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: ConfigId,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const permissions = await this.permissionsService.getPermissionsByNames(
      assignPermissionsDto.permissions,
    );
    const permissionIds = permissions.map((permission) => permission.id);
    return this.rolesService.assignPermissionsToRole(roleId, permissionIds);
  }

  @Put(':roleId/permissions')
  async updatePermissionsForRole(
    @Param('roleId') roleId: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ) {
    const permissions = await this.permissionsService.getPermissionsByNames(
      updatePermissionsDto.permissions,
    );
    const permissionIds = permissions.map((permission) => permission.id);
    return this.rolesService.updatePermissionsForRole(roleId, permissionIds);
  }

  @Delete(':roleId/permissions')
  async removePermissionsFromRole(
    @Param('roleId') roleId: string,
    @Body() removePermissionsDto: RemovePermissionsDto,
  ) {
    const permissions = await this.permissionsService.getPermissionsByNames(
      removePermissionsDto.permissions,
    );
    const permissionIds = permissions.map((permission) => permission.id);
    return this.rolesService.removePermissionsFromRole(roleId, permissionIds);
  }
}
