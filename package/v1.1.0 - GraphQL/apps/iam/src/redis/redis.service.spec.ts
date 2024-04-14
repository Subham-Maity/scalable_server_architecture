import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let cacheManagerMock: any;

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'CACHE_MANAGER',
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  describe('get', () => {
    it('should return the value for the given key', async () => {
      const key = 'test-key';
      const value = 'test-value';
      cacheManagerMock.get.mockResolvedValueOnce(value);

      const result = await service.get(key);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });
  });

  describe('set', () => {
    it('should set the key-value pair with the given TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttlInSeconds = 60;

      await service.set(key, value, ttlInSeconds);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(key, value, ttlInSeconds * 1000);
    });

    it('should set the key-value pair without a TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await service.set(key, value);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(key, value, 3600 * 1000);
    });
  });

  describe('del', () => {
    it('should delete the key', async () => {
      const key = 'test-key';

      await service.del(key);

      expect(cacheManagerMock.del).toHaveBeenCalledWith(key);
    });
  });

  describe('reset', () => {
    it('should reset the Redis cache', async () => {
      await service.reset();

      expect(cacheManagerMock.reset).toHaveBeenCalled();
    });
  });

  describe('mget', () => {
    it('should return an array of values for the given keys', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const values = ['value1', 'value2', 'value3'];
      cacheManagerMock.get.mockImplementation((key: string) => {
        const index = keys.indexOf(key);
        return Promise.resolve(values[index]);
      });

      const result = await service.mget(keys);

      expect(result).toEqual(values);
    });
  });
});
