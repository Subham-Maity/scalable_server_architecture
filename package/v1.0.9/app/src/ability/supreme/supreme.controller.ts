import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';

import { SupremeService } from './supreme.service';
import { AdminGuard, SuperAdminGuard } from '../guard';

@Controller('supreme')
export class SupremeController {
  constructor(private roleService: SupremeService) {}
  @UseGuards(SuperAdminGuard)
  @Post('set-admin')
  async setAdminRole(@Body('email') email: string) {
    return this.roleService.setAdminRole(email);
  }
  @UseGuards(AdminGuard)
  @Post(':userId')
  async assignRoleToUser(@Param('userId') userId: string, @Body('roleId') roleId: string) {
    return this.roleService.assignRoleToUser(userId, roleId);
  }
}
