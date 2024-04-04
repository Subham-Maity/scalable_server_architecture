import { Body, Controller, Param, Post } from '@nestjs/common';

import { SupremeService } from './supreme.service';

@Controller('supreme')
export class SupremeController {
  constructor(private roleService: SupremeService) {}
  @Post('set-admin')
  async setAdminRole(@Body('email') email: string) {
    return this.roleService.setAdminRole(email);
  }
  @Post(':userId')
  async assignRoleToUser(@Param('userId') userId: string, @Body('roleId') roleId: string) {
    return this.roleService.assignRoleToUser(userId, roleId);
  }
}
