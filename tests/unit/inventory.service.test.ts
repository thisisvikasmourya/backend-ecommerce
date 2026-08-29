import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../../src/modules/inventory/inventory.service.js';
import { BadRequestError, NotFoundError } from '../../src/common/errors/app-error.js';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockInventoryRepo: any;

  beforeEach(() => {
    mockInventoryRepo = {
      findByVariantId: vi.fn(),
      findAll: vi.fn(),
      findLowStock: vi.fn(),
      updateStock: vi.fn(),
      createMovement: vi.fn(),
    };
    inventoryService = new InventoryService(mockInventoryRepo);
  });

  describe('reserveStock', () => {
    it('should successfully reserve stock when availableStock is sufficient', async () => {
      mockInventoryRepo.findByVariantId.mockResolvedValue({
        id: 'inv-1',
        variantId: 'var-1',
        availableStock: 50,
        reservedStock: 10,
        soldStock: 5,
      });

      mockInventoryRepo.updateStock.mockResolvedValue({
        id: 'inv-1',
        availableStock: 45,
        reservedStock: 15,
        soldStock: 5,
      });

      const result = await inventoryService.reserveStock('var-1', 5, 'ORD-123');

      expect(mockInventoryRepo.updateStock).toHaveBeenCalledWith(
        'inv-1',
        { availableStock: 45, reservedStock: 15 },
        expect.objectContaining({
          quantity: 5,
          type: 'RESERVED',
          referenceId: 'ORD-123',
        }),
        undefined,
      );
      expect(result.availableStock).toBe(45);
    });

    it('should throw BadRequestError with INSUFFICIENT_STOCK code when requested quantity exceeds available stock', async () => {
      mockInventoryRepo.findByVariantId.mockResolvedValue({
        id: 'inv-1',
        variantId: 'var-1',
        availableStock: 3,
        reservedStock: 0,
        soldStock: 0,
      });

      await expect(inventoryService.reserveStock('var-1', 10)).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError when variant inventory does not exist', async () => {
      mockInventoryRepo.findByVariantId.mockResolvedValue(null);

      await expect(inventoryService.reserveStock('var-nonexistent', 1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('releaseStock', () => {
    it('should release reserved stock back to available stock', async () => {
      mockInventoryRepo.findByVariantId.mockResolvedValue({
        id: 'inv-1',
        variantId: 'var-1',
        availableStock: 40,
        reservedStock: 10,
        soldStock: 0,
      });

      mockInventoryRepo.updateStock.mockResolvedValue({
        id: 'inv-1',
        availableStock: 45,
        reservedStock: 5,
        soldStock: 0,
      });

      const result = await inventoryService.releaseStock('var-1', 5, 'ORD-123');

      expect(mockInventoryRepo.updateStock).toHaveBeenCalledWith(
        'inv-1',
        { availableStock: 45, reservedStock: 5 },
        expect.objectContaining({
          quantity: 5,
          type: 'RESERVATION_RELEASED',
        }),
        undefined,
      );
      expect(result.availableStock).toBe(45);
    });
  });

  describe('confirmSold', () => {
    it('should convert reserved stock into sold stock upon payment success', async () => {
      mockInventoryRepo.findByVariantId.mockResolvedValue({
        id: 'inv-1',
        variantId: 'var-1',
        availableStock: 45,
        reservedStock: 5,
        soldStock: 20,
      });

      mockInventoryRepo.updateStock.mockResolvedValue({
        id: 'inv-1',
        availableStock: 45,
        reservedStock: 0,
        soldStock: 25,
      });

      const result = await inventoryService.confirmSold('var-1', 5, 'ORD-123');

      expect(mockInventoryRepo.updateStock).toHaveBeenCalledWith(
        'inv-1',
        { reservedStock: 0, soldStock: 25 },
        expect.objectContaining({
          quantity: 5,
          type: 'SOLD',
        }),
        undefined,
      );
      expect(result.soldStock).toBe(25);
    });
  });

  describe('restock', () => {
    it('should increment available stock and record RESTOCK movement', async () => {
      mockInventoryRepo.findByVariantId.mockResolvedValue({
        id: 'inv-1',
        variantId: 'var-1',
        availableStock: 20,
        reservedStock: 0,
        soldStock: 0,
      });

      mockInventoryRepo.updateStock.mockResolvedValue({
        id: 'inv-1',
        availableStock: 50,
        reservedStock: 0,
        soldStock: 0,
      });

      await inventoryService.restock({ variantId: 'var-1', quantity: 30, notes: 'Supplier shipment' });

      expect(mockInventoryRepo.updateStock).toHaveBeenCalledWith(
        'inv-1',
        { availableStock: 50 },
        expect.objectContaining({
          quantity: 30,
          type: 'RESTOCK',
          notes: 'Supplier shipment',
        }),
      );
    });
  });
});
