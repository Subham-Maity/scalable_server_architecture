import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'The email of the user.',
    example: 'user@example.com',
    required: true,
  })
  @Length(5, 255, { message: 'Email must be between 5 and 255 characters long.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsString({ message: 'Email must be a string.' })
  email: string;
}
