import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ErrorType {
  @Field()
  message: string;

  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class RegisterResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class VerifyAccountResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
