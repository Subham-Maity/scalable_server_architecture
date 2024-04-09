import { IsOptional, IsString } from 'class-validator';
export class CreateRoleDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
}