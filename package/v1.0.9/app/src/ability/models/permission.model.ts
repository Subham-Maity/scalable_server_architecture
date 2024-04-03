import { ObjectType, Field, ID } from '@nestjs/graphql';
import { RolePermission } from './role-permission.model';

@ObjectType()
export class Permission {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  action: string;

  @Field(() => [RolePermission])
  roles: RolePermission[];
}
