import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { GeoService } from './geo.service';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetAllGeoDto } from './dto';
import { GeoLog } from '@prisma/client';

@ApiTags('🌏 Geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('ip-details/:ipAddress')
  @ApiOperation({ summary: 'Get IP details' })
  @ApiOkResponse({ description: 'The IP details have been successfully retrieved.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async getIpDetails(@Param('ipAddress') ipAddress: string) {
    try {
      return await this.geoService.getIpDetails(ipAddress);
    } catch (error) {
      this.handleError(error);
    }
  }

  @SkipThrottle()
  @Get()
  @ApiOperation({
    summary: 'Get all geo logs',
    description: `
      This endpoint returns a list of all geo logs. You can use various query parameters to filter, sort, and paginate the results.

      Query Parameters:
      - **page (number)**: The page number for pagination (default: 1)
      - **limit (number)**: The number of items per page for pagination (default: 10)
      - **sortBy (string)**: The field to sort by (e.g., createdAt, updatedAt, email, ipAddress, action, userAgent)
      - **order (string)**: The order to sort by (asc or desc, default: asc)
      - **q (string)**: The search query to filter geo logs by email, ipAddress, action, or userAgent
      - **Any other field from the GeoLog model can be used for filtering**

      **Example Queries:**
      - Get all geo logs: \`/geo\`
      - Get geo logs on page 2 with 20 items per page: \`/geo?page=2&limit=20\`
      - Get geo logs sorted by createdAt in descending order: \`/geo?sortBy=createdAt&order=desc\`
      - Search for geo logs with email containing 'example': \`/geo?q=example\`
      - Filter geo logs by ipAddress '::1': \`/geo?ipAddress=::1\`
      - Combine multiple parameters: \`/geo?id=661659e43d710176d9c0e71e&userId=660be4c6a7d2805486136973&email=maitysubham4041@gmail.com&ipAddress=::1&action=Logout&userAgent=PostmanRuntime/7.37.3&reason=any&createdAt=2024-04-10T09:20:36.172Z&updatedAt=2024-04-10T09:20:36.172Z&sortBy=createdAt&order=asc&q=maity&page=1&limit=1\`
    `,
  })
  @ApiOkResponse({
    status: 200,
    description: "The geo logs' information has been successfully retrieved.",
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @ApiQuery({ type: GetAllGeoDto, name: 'filters', required: false })
  async getAllGeoLogs(@Query() dto: GetAllGeoDto): Promise<GeoLog[]> {
    try {
      return await this.geoService.getAllGeoLogs(dto);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof Error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      throw new HttpException('An unexpected error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
