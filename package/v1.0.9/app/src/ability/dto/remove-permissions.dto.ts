import { IsArray } from 'class-validator';

export class RemovePermissionsDto {
  @IsArray()
  permissions: string[];
}
