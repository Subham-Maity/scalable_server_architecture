import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionsDto {
  @ApiProperty({
    description: 'The updated permissions.',
    example: ['read', 'write'],
    required: true,
  })
  @IsArray()
  @IsString({ each: true, message: 'Each permissions must be a string.' })
  permissions: string[];
}
