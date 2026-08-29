import { prisma } from '../config/database.js';
import { inventoryService } from '../modules/inventory/inventory.service.js';
import { logger } from '../config/logger.js';

export async function releaseExpiredReservations(): Promise<number> {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Find pending orders older than 30 minutes
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lte: thirtyMinutesAgo },
    },
    include: {
      items: true,
    },
  });

  if (expiredOrders.length === 0) return 0;

  logger.info(`🧹 Found ${expiredOrders.length} expired pending orders to release stock.`);

  for (const order of expiredOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.variantId) {
            await inventoryService.releaseStock(
              item.variantId,
              item.quantity,
              order.orderNumber,
              tx,
            );
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });
      });

      logger.info(
        { orderNumber: order.orderNumber },
        '✅ Released expired stock and cancelled order',
      );
    } catch (err: any) {
      logger.error(
        { err: err.message, orderNumber: order.orderNumber },
        'Failed to release expired order stock',
      );
    }
  }

  return expiredOrders.length;
}
