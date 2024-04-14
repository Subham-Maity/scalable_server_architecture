import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'The ID of the user to assign the role to',
    example: '12345',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the role to assign',
    example: '54321',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
