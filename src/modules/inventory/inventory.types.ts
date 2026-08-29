import { Inventory, InventoryMovement, InventoryMovementType } from '@prisma/client';

export type { Inventory, InventoryMovement, InventoryMovementType };

export interface InventoryWithVariant extends Inventory {
  variant: {
    id: string;
    sku: string;
    price: any;
    color?: string | null;
    size?: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface RestockDTO {
  variantId: string;
  quantity: number;
  notes?: string;
}
