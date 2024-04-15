import { ObjectType, Field, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields:"id")')
export class Signup {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  hash: string;

  @Field({ nullable: true })
  activationToken?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
