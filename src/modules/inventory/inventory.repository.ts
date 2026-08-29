import { prisma } from '../../config/database.js';
import { Inventory, InventoryMovement, InventoryMovementType, Prisma } from '@prisma/client';

export class InventoryRepository {
  public async findByVariantId(variantId: string, tx?: Prisma.TransactionClient): Promise<Inventory | null> {
    const client = tx || prisma;
    return client.inventory.findUnique({
      where: { variantId },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  public async findAll(): Promise<any[]> {
    return prisma.inventory.findMany({
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { availableStock: 'asc' },
    });
  }

  public async findLowStock(threshold: number = 10): Promise<any[]> {
    return prisma.inventory.findMany({
      where: {
        availableStock: { lte: threshold },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { availableStock: 'asc' },
    });
  }

  public async updateStock(
    inventoryId: string,
    data: {
      availableStock?: number;
      reservedStock?: number;
      soldStock?: number;
    },
    movement?: {
      quantity: number;
      type: InventoryMovementType;
      referenceId?: string;
      notes?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Inventory> {
    const client = tx || prisma;
    return client.inventory.update({
      where: { id: inventoryId },
      data: {
        ...data,
        movements: movement
          ? {
              create: movement,
            }
          : undefined,
      },
      include: {
        movements: true,
      },
    });
  }

  public async createMovement(
    inventoryId: string,
    movement: {
      quantity: number;
      type: InventoryMovementType;
      referenceId?: string;
      notes?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<InventoryMovement> {
    const client = tx || prisma;
    return client.inventoryMovement.create({
      data: {
        inventoryId,
        ...movement,
      },
    });
  }
}

export const inventoryRepository = new InventoryRepository();
