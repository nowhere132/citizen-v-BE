import Redis from 'ioredis';
import Logger from './logger';

const logger = Logger.create('redis');

class RedisConnection {
  private client: Redis.Redis;

  getClient(): Redis.Redis {
    const { REDIS_PORT, REDIS_HOST } = process.env;
    if (!this.client) {
      this.client = new Redis(<number><unknown>REDIS_PORT, REDIS_HOST, {
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
      this.client.on('connect', () => {
        logger.info('connected to redis: ', this.client.status);
      });
      this.client.on('connecting', () => {
        logger.info('connecting to redis: ', this.client.status);
      });
    }
    return this.client;
  }
}

export default new RedisConnection();
