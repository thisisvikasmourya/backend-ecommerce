import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response.js';
import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';

export class HealthController {
  public async getHealth(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  public async getLiveness(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      status: 'live',
      timestamp: new Date().toISOString(),
    });
  }

  public async getReadiness(_req: Request, res: Response): Promise<void> {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'unreachable';
    }

    try {
      if (redis.status === 'ready') {
        redisStatus = 'connected';
      } else {
        redisStatus = redis.status;
      }
    } catch {
      redisStatus = 'unreachable';
    }

    sendSuccess(res, {
      status: dbStatus === 'connected' ? 'ready' : 'degraded',
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

export const healthController = new HealthController();
