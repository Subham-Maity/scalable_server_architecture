import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserTokenDto {
  @ApiProperty({
    description: 'Users id based on token',
    example: '660140d7f653f606b04cc3fa',
    required: true,
  })
  @IsString()
  sub: string;
  @ApiProperty({
    description: 'Users email based on token',
    example: 'maitysubham4041@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    description: 'Users email based on token',
    example: 'maitysubham4041@gmail.com',
    required: true,
  })
  @ApiProperty({
    description: 'Users iat based on token',
    example: '1710000108',
  })
  @IsNumber()
  iat: number;
  @ApiProperty({
    description: 'Users exp based on token',
    example: '1710000108',
    required: true,
  })
  @IsNumber()
  exp: number;
  @ApiProperty({
    description: 'Users token rt.token based on token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp....',
    required: true,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
