import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UserIdDto } from './dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(
      createPermissionDto.name,
      createPermissionDto.action,
    );
  }

  @Get()
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  @Get(':id')
  getPermissionById(@Param('id') id: UserIdDto) {
    return this.permissionsService.getPermissionById(id);
  }
}
