import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllPermissionsDto {
  @ApiProperty({
    description: 'The ID of the permission to filter by.',
    example: '66166bc9baa75e6529bf113c',
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
    description: 'The search query to filter permissions by name or action.',
    example: 'any1',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'The name of the permission to filter by.',
    example: 'Any1',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The action of the permission to filter by.',
    example: 'Any1',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'The created at date of the permission to filter by.',
    example: '2024-04-10T10:36:57.179Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({
    description: 'The updated at date of the permission to filter by.',
    example: '2024-04-10T10:36:57.179Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
