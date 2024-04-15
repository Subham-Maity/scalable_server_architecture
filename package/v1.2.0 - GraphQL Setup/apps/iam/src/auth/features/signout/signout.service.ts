import { Injectable } from '@nestjs/common';

import { Response } from 'express';

import { auth_refresh_token_hash_key_prefix_for_redis } from '../../constant';
import { clearCookie } from '../../../common';
import { GeoService } from '../../../geo/geo.service';
import { RedisService } from '../../../redis';
import { BullService } from '../../../queue/bull';
import { ConfigId } from '../../../common/type';

@Injectable()
export class SignoutService {
  constructor(
    private readonly rtToken: RedisService,
    private readonly geoService: GeoService,
    private readonly queueService: BullService,
  ) {}

  /**Logout Local*/

  async signoutLocal(
    userId: ConfigId,
    res: Response,
    ip: string,
    userAgent: string,
    reason?: string,
  ): Promise<void> {
    await this.rtToken.del(
      `${auth_refresh_token_hash_key_prefix_for_redis}${userId}`,
    );

    // Add a job to the geo-logs queue
    await this.queueService.addGeoLogJob({
      ipAddress: ip,
      action: 'Logout',
      userAgent,
      userId,
      reason,
    });

    // Clear the cookies
    clearCookie(res, 'access_token');
    clearCookie(res, 'refresh_token');
  }
}
