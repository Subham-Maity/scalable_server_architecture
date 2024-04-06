import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDifferentFrom } from '../../../../../common';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The email of the user.',
    example: 'user@example.com',
    required: true,
  })
  @Length(5, 255, { message: 'Email must be between 5 and 255 characters long.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsString({ message: 'Email must be a string.' })
  email: string;

  @ApiProperty({
    description: 'The new password of the user.',
    example: 'NewPassword456!',
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
  @IsDifferentFrom('oldPassword', {
    message: 'New password must be different from the old password.',
  })
  password: string;

  @ApiProperty({
    description: 'The token associated with the password reset request',
    example: 'eyJhbGci...',
    required: true,
  })
  @IsNotEmpty({ message: 'Token is required.' })
  @IsString({ message: 'Token must be a string.' })
  token: string;
}
