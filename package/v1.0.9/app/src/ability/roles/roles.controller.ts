import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  AssignPermissionsDto,
  CreateRoleDto,
  RemovePermissionsDto,
  UpdatePermissionsDto,
  UpdateRoleNameDto,
} from '../dto';
import { PermissionsService } from './permissions.service';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto.name, createRoleDto.description);
  }

  @Get()
  getRoles() {
    return this.rolesService.getRoles();
  }

  @Get(':id')
  getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Put(':id')
  updateRoleName(@Param('id') id: string, @Body() updateRoleNameDto: UpdateRoleNameDto) {
    return this.rolesService.updateRoleName(id, updateRoleNameDto.name);
  }

  @Delete(':id')
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Patch(':roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const permissionIds = await Promise.all(
      assignPermissionsDto.permissions.map((permission) =>
        this.permissionsService.getPermissionIdByName(permission),
      ),
    );
    return this.rolesService.assignPermissionsToRole(roleId, permissionIds);
  }

  @Put(':roleId/permissions')
  async updatePermissionsForRole(
    @Param('roleId') roleId: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ) {
    const permissionIds = await Promise.all(
      updatePermissionsDto.permissions.map((permission) =>
        this.permissionsService.getPermissionIdByName(permission),
      ),
    );
    return this.rolesService.updatePermissionsForRole(roleId, permissionIds);
  }

  @Delete(':roleId/permissions')
  async removePermissionsFromRole(
    @Param('roleId') roleId: string,
    @Body() removePermissionsDto: RemovePermissionsDto,
  ) {
    const permissionIds = await Promise.all(
      removePermissionsDto.permissions.map((permission) =>
        this.permissionsService.getPermissionIdByName(permission),
      ),
    );
    return this.rolesService.removePermissionsFromRole(roleId, permissionIds);
  }
}
