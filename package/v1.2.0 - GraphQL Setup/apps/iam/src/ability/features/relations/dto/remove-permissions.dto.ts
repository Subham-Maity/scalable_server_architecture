import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemovePermissionsDto {
  @ApiProperty({
    description: 'The permissions to be removed.',
    example: ['read', 'write'],
    required: true,
  })
  @IsArray()
  permissions: string[];
}
