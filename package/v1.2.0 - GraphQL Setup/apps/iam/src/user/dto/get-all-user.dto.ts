import { IsOptional, IsString, IsIn, IsEmail, IsBoolean, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllUsersDto {
  @ApiProperty({
    description: 'The ID of the user to filter by.',
    example: '660be4c6a7d2805486136973',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'The page number for pagination.',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page?: number;

  @ApiProperty({
    description: 'The number of items per page for pagination.',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit?: number;

  @ApiProperty({
    description: 'The field to sort by.',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'The order to sort by.',
    example: 'asc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiProperty({
    description: 'The search query to filter users by.',
    example: 'example',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'The email of the user to filter by.',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The first name of the user to filter by.',
    example: 'Subham',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user to filter by.',
    example: 'Maity',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'The deleted status of the user to filter by.',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  deleted?: boolean;

  @ApiProperty({
    description: 'The role ID of the user to filter by.',
    example: '6610344b2e5213cac073aff5',
    required: false,
  })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiProperty({
    description: 'The created at date of the user to filter by.',
    example: '2024-04-02T10:58:14.963Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({
    description: 'The updated at date of the user to filter by.',
    example: '2024-04-10T10:26:56.348Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
