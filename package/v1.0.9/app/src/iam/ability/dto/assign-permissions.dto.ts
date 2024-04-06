import { IsArray } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  permissions: string[];
}
