import { Request, Response } from 'express';
import { inventoryService, InventoryService } from './inventory.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';

export class InventoryController {
  constructor(private readonly service: InventoryService = inventoryService) {}

  public async getAllInventory(_req: Request, res: Response): Promise<void> {
    const inventory = await this.service.getAllInventory();
    sendSuccess(res, inventory);
  }

  public async getLowStock(req: Request, res: Response): Promise<void> {
    const threshold = Number(req.query.threshold) || 10;
    const inventory = await this.service.getLowStock(threshold);
    sendSuccess(res, inventory);
  }

  public async getInventoryByVariant(req: Request, res: Response): Promise<void> {
    const inventory = await this.service.getInventoryByVariantId(req.params.variantId);
    sendSuccess(res, inventory);
  }

  public async restock(req: Request, res: Response): Promise<void> {
    const inventory = await this.service.restock(req.body);
    sendCreated(res, inventory);
  }
}

export const inventoryController = new InventoryController();
