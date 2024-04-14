import { IsNotEmpty, IsString, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserIdDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class EmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class GeoTrackDto {
  @ValidateNested({ each: true })
  @ValidateIf((dto) => !dto.userId && !dto.email)
  @IsOptional()
  @Type(() => UserIdDto)
  userId?: UserIdDto;

  @ValidateNested({ each: true })
  @ValidateIf((dto) => !dto.email && !dto.userId)
  @IsOptional()
  @Type(() => EmailDto)
  email?: EmailDto;

  @IsNotEmpty()
  @IsString()
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsString()
  userAgent: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
