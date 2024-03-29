import { IsOptional, IsString, IsIn, IsEmail, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllUsersDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
