import { Injectable } from '@nestjs/common';
import { PasswordHash } from './hash.service';
import { ConfigId } from '../../types';
import { RedisService } from '../../redis';
import {
  auth_refresh_token_hash_key_prefix_for_redis,
  auth_refresh_token_hash_ttl_for_redis,
} from '../constant';

@Injectable()
export class RtTokenService {
  constructor(private readonly redisService: RedisService) {}

  updateRtHash = async (userId: ConfigId, rt: string): Promise<void> => {
    const hash = await PasswordHash.hashRefreshToken(rt);

    await this.redisService.set(
      `${auth_refresh_token_hash_key_prefix_for_redis}${userId}`,
      hash,
      auth_refresh_token_hash_ttl_for_redis,
    );
  };
}
