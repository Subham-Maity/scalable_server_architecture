import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleNameDto {
  @ApiProperty({
    description: 'The updated name of the role.',
    example: 'moderator',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The updated description of the role.',
    example: 'Moderator role',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
