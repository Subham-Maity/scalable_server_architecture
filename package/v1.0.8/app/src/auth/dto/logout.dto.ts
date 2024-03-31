import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ConfigId } from '../../types';

export class LogoutDto {
  @ApiProperty({
    description: 'This userId is required to log out',
    example: '660140d7f653f606b04cc3fa',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: ConfigId;
}
