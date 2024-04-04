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
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: '660e22d7d269b30e7841bbd8',
        permissionId: '660e22dcd269b30e7841bbd9',
      },
    });

    console.log('rolePermissions' + JSON.stringify(rolePermissions));
    const readUsersPermission = await this.prisma.permission.findUnique({
      where: { name: 'ReadUsers' },
    });

    console.log('ReadUsers', JSON.stringify(readUsersPermission));

    const managerRole = await this.prisma.role.findUnique({
      where: { name: 'Manager' },
      include: { permissions: true },
    });

    console.log('managerRole', JSON.stringify(managerRole));

    //Log user based on roleid

    const user = await this.prisma.user.findMany({
      where: { roleId: '660e15f4085f4eaa737d838a' },
      include: { role: true },
    });
    console.log('This is User', JSON.stringify(user));
    const user2 = await this.prisma.user.findMany({
      where: {
        role: {
          permissions: {
            some: {
              permission: {
                name: 'ReadUsers',
              },
            },
          },
        },
      },
      include: { role: true },
    });

    console.log('This is User', JSON.stringify(user2));
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
