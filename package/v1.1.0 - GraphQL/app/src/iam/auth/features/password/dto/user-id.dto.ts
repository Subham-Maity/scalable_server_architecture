import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdDto {
  @ApiProperty({
    description: 'The user ID.',
    example: '123456789',
    required: true,
  })
  @IsNotEmpty()
  sub: string;
}
