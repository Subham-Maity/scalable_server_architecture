/** TTL: Calculations
 * 3600 seconds = 1 hour
 * 604800/3600 = 168 hours
 * 24 hours = 1 day
 * 168 days = 7 days
 *
 * 60 seconds = 1 minute
 * 300 seconds = 5 minutes
 */

export const auth_otp_key_prefix_for_redis: string = '_auth_otp_key_reset_password';

export const auth_otp_ttl_for_redis: number = 300;
export const auth_refresh_token_hash_key_prefix_for_redis: string =
  '_auth_rt_token_hash_key_for_users';

//make sure it should same as JWT_LOCAL_RT_EXPIRES_IN
export const auth_refresh_token_hash_ttl_for_redis: number = 604800;
