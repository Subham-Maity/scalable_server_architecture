import { Injectable } from '@nestjs/common';

import { Response } from 'express';
import { RedisService } from '../../../../redis';
import { asyncErrorHandler } from '../../../../errors';
import { ConfigId } from '../../../../types';
import { auth_refresh_token_hash_key_prefix_for_redis } from '../../constant';
import { clearCookie } from '../../../common';
import { GeoService } from '../../../geo/geo.service';
import { BullService } from '../../../../queue/bull';

@Injectable()
export class SignoutService {
  constructor(
    private readonly rtToken: RedisService,
    private readonly geoService: GeoService,
    private readonly queueService: BullService,
  ) {}

  /**Logout Local*/
  signoutLocal = asyncErrorHandler(
    async (
      userId: ConfigId,
      res: Response,
      ip: string,
      userAgent: string,
      reason?: string,
    ): Promise<void> => {
      await this.rtToken.del(`${auth_refresh_token_hash_key_prefix_for_redis}${userId}`);

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
    },
  );
}
