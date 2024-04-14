import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlacklistRefreshTokensDto {
  @ApiProperty({
    description: 'Blacklist tokens using the provided emails.',
    example: 'user@example.com',
    required: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each email must be a string.' })
  @Length(5, 255, { each: true })
  @IsEmail({}, { each: true })
  emails?: string[];
}
