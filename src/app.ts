import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';
import { errorHandler } from './common/middleware/error.middleware.js';
import { apiRouter } from './modules/routes.js';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Request ID middleware
  app.use(requestIdMiddleware);

  // HTTP Request Logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.headers['x-request-id'] as string,
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'E-Commerce Backend API',
      version: '1.0.0',
      status: 'active',
      docs: `${env.API_PREFIX}/health`,
    });
  });

  // API Routes
  app.use(env.API_PREFIX, apiRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
