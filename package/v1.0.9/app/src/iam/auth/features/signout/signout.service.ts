import { Injectable } from '@nestjs/common';

import { Response } from 'express';
import { RedisService } from '../../../../redis';
import { asyncErrorHandler } from '../../../../errors';
import { ConfigId } from '../../../../types';
import { auth_refresh_token_hash_key_prefix_for_redis } from '../../constant';
import { clearCookie } from '../../../common';

@Injectable()
export class SignoutService {
  constructor(private readonly rtToken: RedisService) {}

  /**Logout Local*/
  signoutLocal = asyncErrorHandler(async (userId: ConfigId, res: Response): Promise<void> => {
    await this.rtToken.del(`${auth_refresh_token_hash_key_prefix_for_redis}${userId}`);
    // Clear the cookies
    clearCookie(res, 'access_token');
    clearCookie(res, 'refresh_token');
  });
}
