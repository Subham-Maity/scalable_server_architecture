import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GeoUtilService } from './geo.service';

@Controller('geo-util')
export class GeoUtilController {
  constructor(private readonly geoUtilService: GeoUtilService) {}

  @Get()
  async getLocationDetails(@Req() request: Request, @Res() response: Response): Promise<void> {
    const ipAddr = this.geoUtilService.getIpAddress(request);
    const locationDetails = this.geoUtilService.getLocationDetails(ipAddr);

    response.status(200).json(locationDetails);
  }
}
