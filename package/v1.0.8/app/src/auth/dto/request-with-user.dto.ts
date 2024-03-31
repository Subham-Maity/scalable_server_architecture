import { UserTokenDto } from './user-token.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    required: true,
  })
  @IsOptional()
  @IsString()
  user?: UserTokenDto;
}
