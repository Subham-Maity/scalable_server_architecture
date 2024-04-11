import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    example: '660be4c6a7d2805486136973',
  })
  id: string;

  @ApiProperty({
    description: 'The date and time when the user was created.',
    example: '2024-04-02T10:58:14.963Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The date and time when the user was last updated.',
    example: '2024-04-05T19:13:30.932Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'The email address of the user.',
    example: 'maitysubham4041@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'The first name of the user.',
    example: 'Subham',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user.',
    example: 'Maity',
  })
  lastName: string;

  @ApiProperty({
    description: 'A flag indicating if the user has been deleted.',
    example: false,
  })
  deleted: boolean;

  @ApiProperty({
    description: "The unique identifier of the user's role.",
    example: '6610344b2e5213cac073aff5',
  })
  roleId: string;
}
