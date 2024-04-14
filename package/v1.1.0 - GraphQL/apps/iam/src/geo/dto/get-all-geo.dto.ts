import { IsOptional, IsString, IsIn, IsEmail, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllGeoDto {
  @ApiProperty({
    description: 'The ID of the geo log to filter by.',
    example: '661659e43d710176d9c0e71e',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'The user ID of the geo log to filter by.',
    example: '660be4c6a7d2805486136973',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'The email of the user associated with the geo log to filter by.',
    example: 'maitysubham4041@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The IP address of the geo log to filter by.',
    example: '::1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'The action of the geo log to filter by.',
    example: 'Logout',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'The user agent of the geo log to filter by.',
    example: 'PostmanRuntime/7.37.3',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

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
    description: 'The search query to filter geo logs by.',
    example: 'example',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'The created at date of the geo log to filter by.',
    example: '2024-04-10T09:20:36.172Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({
    description: 'The updated at date of the geo log to filter by.',
    example: '2024-04-10T09:20:36.172Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
