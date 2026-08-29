import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

async function bootstrap() {
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📦 API available at http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`💓 Healthcheck at http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  // Attempt database and redis connections in background so server still starts
  connectDatabase().catch((err) => {
    logger.warn(
      { err: err.message },
      '⚠️ Database connection pending (ensure PostgreSQL is running)',
    );
  });

  connectRedis().catch((err) => {
    logger.warn({ err: err.message }, '⚠️ Redis connection pending (ensure Redis is running)');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);
    server.close(async () => {
      logger.info('🛑 HTTP server closed.');
      try {
        await disconnectDatabase();
        await disconnectRedis();
      } catch (err) {
        logger.error({ err }, 'Error during disconnects');
      }
      logger.info('👋 Graceful shutdown complete.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('⏰ Shutdown timed out, forcing exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, '❌ Unhandled Promise Rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, '💥 Uncaught Exception');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, '💥 Failed to start application');
  process.exit(1);
});
