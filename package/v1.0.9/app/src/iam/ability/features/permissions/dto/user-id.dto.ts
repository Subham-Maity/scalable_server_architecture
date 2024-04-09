import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    example: '123456789',
    required: true,
  })
  @IsNotEmpty()
  id: string;
}
