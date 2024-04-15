import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyAccountDto {
  @ApiProperty({
    description: 'The token used for account verification',
    example: 'eyJlbWFpbCI6InVzZWxlc3Nib3...',
    required: true,
  })
  @Field()
  token: string;
}
