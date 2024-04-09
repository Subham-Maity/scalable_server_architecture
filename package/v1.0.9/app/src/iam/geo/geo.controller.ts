import { Controller, Get, Param } from '@nestjs/common';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('ip-details/:ipAddress')
  async getIpDetails(@Param('ipAddress') ipAddress: string) {
    return await this.geoService.getIpDetails(ipAddress);
  }
  @Get('logs')
  async getAllLogs() {
    return this.geoService.getAllLogs();
  }
}
