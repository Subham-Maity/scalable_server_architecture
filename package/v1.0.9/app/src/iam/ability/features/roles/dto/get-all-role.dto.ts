import { IsOptional, IsString, IsIn, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllRolesDto {
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
    example: 'name',
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
    description: 'The search query to filter roles by.',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'The name of the role to filter by.',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The description of the role to filter by.',
    example: 'Can do everything',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The created at date of the role to filter by.',
    example: '2024-04-10T10:37:16.690Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  createdAt?: Date;

  @ApiProperty({
    description: 'The updated at date of the role to filter by.',
    example: '2024-04-10T10:37:16.690Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  updatedAt?: Date;
}
