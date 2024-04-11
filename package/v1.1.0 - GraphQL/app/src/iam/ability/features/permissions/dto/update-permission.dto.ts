import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'The updated name of the permission.',
    example: 'write',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The updated action of the permission.',
    example: 'update',
    required: true,
  })
  @IsString()
  action: string;
}
