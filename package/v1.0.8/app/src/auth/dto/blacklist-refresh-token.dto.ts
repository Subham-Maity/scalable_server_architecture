import { IsArray, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class BlacklistRefreshTokensDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each email must be a string.' })
  @Length(5, 255, { each: true })
  @IsEmail({}, { each: true })
  emails?: string[];
}
