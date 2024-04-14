import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The name of the permission.',
    example: 'read',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The action of the permission.',
    example: 'create',
    required: true,
  })
  @IsString()
  action: string;
}
