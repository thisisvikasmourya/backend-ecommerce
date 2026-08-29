import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

export const EMAIL_QUEUE_NAME = 'email-queue';
export const INVENTORY_QUEUE_NAME = 'inventory-queue';
export const NOTIFICATION_QUEUE_NAME = 'notification-queue';

let emailQueue: Queue | null = null;
let inventoryQueue: Queue | null = null;
let notificationQueue: Queue | null = null;

try {
  emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  });

  inventoryQueue = new Queue(INVENTORY_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  });

  notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: true,
    },
  });
} catch (err: any) {
  logger.warn({ err: err.message }, '⚠️ BullMQ queues running in fallback mode');
}

export { emailQueue, inventoryQueue, notificationQueue };
