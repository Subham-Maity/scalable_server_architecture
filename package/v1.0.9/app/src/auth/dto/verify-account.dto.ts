import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDto {
  @ApiProperty({
    description: 'The token used for account verification',
    example: 'eyJlbWFpbCI6InVzZWxlc3Nib3...',
    required: true,
  })
  token: string;
}
