import { z } from 'zod';

export const restockSchema = z.object({
  body: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
    notes: z.string().max(200).optional(),
  }),
});

export const getInventoryByVariantSchema = z.object({
  params: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
  }),
});

export const getLowStockQuerySchema = z.object({
  query: z.object({
    threshold: z.coerce.number().int().positive().default(10),
  }),
});

export type RestockInput = z.infer<typeof restockSchema>['body'];
