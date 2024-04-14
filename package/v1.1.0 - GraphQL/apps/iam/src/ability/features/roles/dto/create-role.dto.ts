import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role.',
    example: 'admin',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the role.',
    example: 'Administrator role',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
