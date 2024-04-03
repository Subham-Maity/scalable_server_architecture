import { IsArray, IsString } from 'class-validator';
export class UpdatePermissionsDto {
  @IsArray()
  @IsString({ each: true, message: 'Each permissions must be a string.' })
  permissions: string[];
}
