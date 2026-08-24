import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let isErrorLogged = false;

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      return null; // Stop retrying after 3 attempts if offline
    }
    return Math.min(times * 1000, 3000);
  },
});

redis.on('connect', () => {
  logger.info(' Connected to Redis');
  isErrorLogged = false;
});

redis.on('error', (err) => {
  if (!isErrorLogged) {
    logger.warn({ err: err.message }, '⚠️ Redis connection offline (caching/queues will be disabled until started)');
    isErrorLogged = true;
  }
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error: any) {
    if (!isErrorLogged) {
      logger.warn('⚠️ Redis offline. Run `docker compose up -d` to start Redis.');
      isErrorLogged = true;
    }
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redis.status === 'ready' || redis.status === 'connecting') {
      await redis.quit();
      logger.info(' Disconnected from Redis');
    }
  } catch {
    // ignore clean disconnect errors if already disconnected
  }
}
