import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from './env.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info(' Connected to PostgreSQL database');
  } catch (error: any) {
    logger.warn('⚠️ PostgreSQL database offline. Run `docker compose up -d` to start PostgreSQL.');
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info(' Disconnected from PostgreSQL database');
  } catch {
    // ignore clean disconnect errors if already disconnected
  }
}
