import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid cart item ID'),
  }),
  body: z.object({
    quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  }),
});

export const cartItemParamSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid cart item ID'),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>['body'];
