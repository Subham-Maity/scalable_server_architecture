import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from './role.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  deleted: boolean;

  @Field(() => Role, { nullable: true })
  role?: Role;

  @Field({ nullable: true })
  roleId?: string;
}
