import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({
    description: 'The email of the user.',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'First name of the user.',
    example: 'Subham',
    required: true,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user.',
    example: 'Maity',
    required: true,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
