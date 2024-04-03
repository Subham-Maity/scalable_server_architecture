import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.model';
import { RolePermission } from './role-permission.model';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [User])
  users: User[];

  @Field(() => [RolePermission])
  permissions: RolePermission[];
}
