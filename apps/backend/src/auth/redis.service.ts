import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  // In-memory fallback
  private mockCache = new Map<string, { value: string; expiresAt: number }>();
  private mockInterval: NodeJS.Timeout | null = null;

  async onModuleInit(): Promise<void> {
    await Promise.resolve();
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
        });

        this.client.on('error', (err) => {
          this.logger.error(
            'Redis client error, falling back to local memory cache',
            err,
          );
          this.client = null;
          this.startMockExpiryCleanup();
        });

        this.client.on('connect', () => {
          this.logger.log('Connected to Redis server successfully');
          this.stopMockExpiryCleanup();
        });
      } catch (error) {
        this.logger.error(
          'Failed to initialize Redis, using local memory cache',
          error,
        );
        this.startMockExpiryCleanup();
      }
    } else {
      this.logger.warn('REDIS_URL not set. Using local memory cache.');
      this.startMockExpiryCleanup();
    }
  }

  onModuleDestroy(): void {
    if (this.client) {
      this.client.disconnect();
    }
    this.stopMockExpiryCleanup();
  }

  private startMockExpiryCleanup(): void {
    if (!this.mockInterval) {
      this.mockInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, item] of this.mockCache.entries()) {
          if (now > item.expiresAt) {
            this.mockCache.delete(key);
          }
        }
      }, 5000); // clean up every 5s
    }
  }

  private stopMockExpiryCleanup(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // failover
      }
    }
    const item = this.mockCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.mockCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // failover
      }
    }
    this.mockCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // failover
      }
    }
    this.mockCache.delete(key);
  }

  async incr(key: string, ttlSeconds = 900): Promise<number> {
    if (this.client) {
      try {
        const val = await this.client.incr(key);
        if (val === 1) {
          await this.client.expire(key, ttlSeconds);
        }
        return val;
      } catch {
        // failover
      }
    }

    const currentStr = await this.get(key);
    const newVal = (currentStr ? parseInt(currentStr, 10) : 0) + 1;
    await this.set(key, newVal.toString(), ttlSeconds);
    return newVal;
  }
}
