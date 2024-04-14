import { Test, TestingModule } from '@nestjs/testing';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';

describe('RedisController', () => {
  let controller: RedisController;
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedisController],
      providers: [
        RedisService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RedisController>(RedisController);
    service = module.get<RedisService>(RedisService);
  });

  describe('getKey', () => {
    it('should return the value for the given key', async () => {
      const key = 'test-key';
      const value = 'test-value';
      jest.spyOn(service, 'get').mockResolvedValueOnce(value);

      const result = await controller.getKey(key);

      expect(service.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it('should throw NotFoundException when key is not found', async () => {
      const key = 'non-existent-key';
      jest.spyOn(service, 'get').mockResolvedValueOnce(null);

      await expect(controller.getKey(key)).rejects.toThrowError(`Key ${key} not found`);
    });
  });

  describe('deleteKey', () => {
    it('should delete the key and return a success message', async () => {
      const key = 'test-key';
      const deleteSpy = jest.spyOn(service, 'del');

      const result = await controller.deleteKey(key);

      expect(deleteSpy).toHaveBeenCalledWith(key);
      expect(result).toBe(`${key} deleted`);
    });
  });

  describe('resetRedis', () => {
    it('should reset the Redis cache and return a success message', async () => {
      const resetSpy = jest.spyOn(service, 'reset');

      const result = await controller.resetRedis();

      expect(resetSpy).toHaveBeenCalled();
      expect(result).toBe('Redis cache cleared');
    });
  });
});
