import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'The permissions to be assigned.',
    example: ['read', 'write'],
    required: true,
  })
  @IsArray()
  permissions: string[];
}
