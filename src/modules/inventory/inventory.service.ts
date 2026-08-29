import { inventoryRepository, InventoryRepository } from './inventory.repository.js';
import { RestockInput } from './inventory.schema.js';
import { NotFoundError, BadRequestError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';

export class InventoryService {
  constructor(private readonly repo: InventoryRepository = inventoryRepository) {}

  public async getInventoryByVariantId(variantId: string) {
    const inventory = await this.repo.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundError('Inventory record not found', ErrorCodes.NOT_FOUND);
    }
    return inventory;
  }

  public async getAllInventory() {
    return this.repo.findAll();
  }

  public async getLowStock(threshold: number = 10) {
    return this.repo.findLowStock(threshold);
  }

  public async restock(input: RestockInput) {
    const inventory = await this.getInventoryByVariantId(input.variantId);
    const newAvailable = inventory.availableStock + input.quantity;

    return this.repo.updateStock(
      inventory.id,
      { availableStock: newAvailable },
      {
        quantity: input.quantity,
        type: 'RESTOCK',
        notes: input.notes || `Restocked ${input.quantity} units`,
      },
    );
  }

  public async reserveStock(
    variantId: string,
    quantity: number,
    referenceId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const inventory = await this.repo.findByVariantId(variantId, tx);
    if (!inventory) {
      throw new NotFoundError(
        `Inventory record for variant ${variantId} not found`,
        ErrorCodes.NOT_FOUND,
      );
    }

    if (inventory.availableStock < quantity) {
      throw new BadRequestError(
        `Insufficient stock for variant ${variantId}. Available: ${inventory.availableStock}, requested: ${quantity}`,
        ErrorCodes.INSUFFICIENT_STOCK,
      );
    }

    return this.repo.updateStock(
      inventory.id,
      {
        availableStock: inventory.availableStock - quantity,
        reservedStock: inventory.reservedStock + quantity,
      },
      {
        quantity,
        type: 'RESERVED',
        referenceId,
        notes: `Reserved ${quantity} units for order checkout`,
      },
      tx,
    );
  }

  public async releaseStock(
    variantId: string,
    quantity: number,
    referenceId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const inventory = await this.repo.findByVariantId(variantId, tx);
    if (!inventory) {
      throw new NotFoundError(
        `Inventory record for variant ${variantId} not found`,
        ErrorCodes.NOT_FOUND,
      );
    }

    const releaseQty = Math.min(inventory.reservedStock, quantity);

    return this.repo.updateStock(
      inventory.id,
      {
        availableStock: inventory.availableStock + releaseQty,
        reservedStock: inventory.reservedStock - releaseQty,
      },
      {
        quantity: releaseQty,
        type: 'RESERVATION_RELEASED',
        referenceId,
        notes: `Released ${releaseQty} reserved units back to available stock`,
      },
      tx,
    );
  }

  public async confirmSold(
    variantId: string,
    quantity: number,
    referenceId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const inventory = await this.repo.findByVariantId(variantId, tx);
    if (!inventory) {
      throw new NotFoundError(
        `Inventory record for variant ${variantId} not found`,
        ErrorCodes.NOT_FOUND,
      );
    }

    const soldQty = Math.min(inventory.reservedStock, quantity);

    return this.repo.updateStock(
      inventory.id,
      {
        reservedStock: inventory.reservedStock - soldQty,
        soldStock: inventory.soldStock + soldQty,
      },
      {
        quantity: soldQty,
        type: 'SOLD',
        referenceId,
        notes: `Confirmed sale of ${soldQty} units after payment success`,
      },
      tx,
    );
  }
}

export const inventoryService = new InventoryService();
