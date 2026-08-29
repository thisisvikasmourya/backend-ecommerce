import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { EMAIL_QUEUE_NAME, INVENTORY_QUEUE_NAME } from './queues.js';
import { releaseExpiredReservations } from './inventory.job.js';

const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

export function startWorkers(): { emailWorker?: Worker; inventoryWorker?: Worker } {
  try {
    const emailWorker = new Worker(
      EMAIL_QUEUE_NAME,
      async (job) => {
        logger.info({ name: job.name, data: job.data }, '📨 Processing email job');
        // Simulated email provider delivery (SendGrid, AWS SES, Resend)
        return { delivered: true, timestamp: new Date().toISOString() };
      },
      { connection: redisConnection },
    );

    emailWorker.on('completed', (job) => {
      logger.info({ jobId: job.id }, '✅ Email job completed successfully');
    });

    emailWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err: err.message }, '❌ Email job failed');
    });

    const inventoryWorker = new Worker(
      INVENTORY_QUEUE_NAME,
      async (job) => {
        if (job.name === 'release-expired-reservations') {
          return releaseExpiredReservations();
        }
      },
      { connection: redisConnection },
    );

    logger.info('👷 BullMQ workers initialized');
    return { emailWorker, inventoryWorker };
  } catch (err: any) {
    logger.warn(
      { err: err.message },
      '⚠️ BullMQ workers initialization skipped (Redis unavailable)',
    );
    return {};
  }
}
