import { Controller, Delete, Get, NotFoundException, Query } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('reset-redis')
  async resetRedis() {
    await this.redisService.reset();
    return 'Redis cache cleared';
  }

  @Get()
  async getKey(@Query('key') key: string) {
    const value = await this.redisService.get(key);
    if (value === null) {
      throw new NotFoundException(`Key ${key} not found`);
    }
    return value;
  }

  @Delete()
  async deleteKey(@Query('key') key: string) {
    await this.redisService.del(key);
    return `${key} deleted`;
  }
}
