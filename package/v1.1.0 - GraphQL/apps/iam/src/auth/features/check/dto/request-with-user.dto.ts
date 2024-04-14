import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UserTokenDto {
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
export class RequestWithUserDto {
  @ApiProperty({
    description: 'Users details based on token',
    example:
      '{\n' +
      "  sub: '660140d7f653f606b04cc3fa',\n" +
      "  email: 'maitysubham4041@gmail.com',\n" +
      '  iat: 1711903308,\n' +
      '  exp: 1712508108,\n' +
      "  refreshToken: 'eyJhbGciOiJIUzI1Ni...." +
      '}\n',
  })
  @IsOptional()
  @IsString()
  user?: UserTokenDto;
}
