import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsNumericString } from '../../common';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The OTP code',
    example: '335626',
    required: true,
  })
  @IsNotEmpty({ message: 'Code is required.' })
  @IsNumericString({ message: 'Code must be numeric.' })
  @Length(6, 6, { message: 'Code must be a 6-digit number.' })
  code: string;

  @ApiProperty({
    description: 'The token associated with the OTP',
    example: 'eyJhbGci...',
    required: true,
  })
  @IsNotEmpty({ message: 'Token is required.' })
  @IsString({ message: 'Token must be a string.' })
  token: string;
}
