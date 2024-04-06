import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsDifferentFrom } from '../../../../../common';

export class SignupDto {
  @ApiProperty({
    description: 'The email of the user.',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsString({ message: 'Email must be a string.' })
  @Length(5, 255)
  email: string;

  @ApiProperty({
    description: 'The password of the user.',
    example: 'Password123!',
    required: true,
  })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password is too short. It should be at least 8 characters.' })
  @MaxLength(100, { message: 'Password is too long. It should be at most 100 characters.' })
  @Matches(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, {
    message: 'Password must contain at least one special character.',
  })
  @Matches(/[a-zA-Z]/, { message: 'Password can only contain Latin letters.' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/[0-9]+/, { message: 'Password must contain at least one number.' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character.',
  })
  @IsDifferentFrom('email', { message: 'Email and password must be different.' })
  password: string;
}
