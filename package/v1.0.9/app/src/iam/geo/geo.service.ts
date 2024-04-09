import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeoService {
  private ipApiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.ipApiUrl = this.configService.get<string>('IP_API_URL');
  }

  async geoTrack(
    ipAddress: string,
    action: string,
    userAgent: string,
    userId?: string | null,
    email?: string | null,
    reason?: string,
  ) {
    let user: any;

    if (userId) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
    } else if (email) {
      user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
    } else {
      throw new Error('Either userId or email must be provided');
    }

    return this.prisma.geoLog.create({
      data: {
        userId: userId || user.id,
        email: email || user.email,
        ipAddress,
        action,
        userAgent,
        reason,
      },
    });
  }

  async getIpDetails(ipAddress: string) {
    const ipDetailsUrl = `${this.ipApiUrl}/${ipAddress}`;
    const ipDetails = await axios.get(ipDetailsUrl);
    return ipDetails.data;
  }
  async getAllLogs() {
    return this.prisma.geoLog.findMany();
  }
}
