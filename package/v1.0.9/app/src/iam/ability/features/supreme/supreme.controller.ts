import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { SupremeService } from './supreme.service';
import { AdminGuard, SuperAdminGuard } from '../../guard';
import { SetAdminDto, AssignRoleDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('🔐 Supreme')
@Controller('supreme')
export class SupremeController {
  constructor(private roleService: SupremeService) {}

  @UseGuards(SuperAdminGuard)
  @Post('set-admin')
  @ApiOperation({ summary: 'Set a user as an admin' })
  @ApiBody({ type: SetAdminDto, description: 'The email of the user to set as admin' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully set as an admin.',
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
    type: HttpException,
  })
  async setAdminRole(@Body() dto: SetAdminDto) {
    try {
      await this.roleService.setAdminRole(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiBody({ type: AssignRoleDto, description: 'The user ID and role ID to assign' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The role has been successfully assigned to the user.',
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
    type: HttpException,
  })
  async assignRoleToUser(@Body() dto: AssignRoleDto) {
    try {
      await this.roleService.assignRoleToUser(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
