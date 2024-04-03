import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from './role.model';
import { Permission } from './permission.model';

@ObjectType()
export class RolePermission {
  @Field(() => ID)
  id: string;

  @Field(() => Role)
  role: Role;

  @Field()
  roleId: string;

  @Field(() => Permission)
  permission: Permission;

  @Field()
  permissionId: string;
}
