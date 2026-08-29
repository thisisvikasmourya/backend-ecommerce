import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z
    .object({
      addressId: z.string().uuid('Invalid address ID').optional(),
      shippingAddress: z
        .object({
          street: z.string().min(3),
          city: z.string().min(2),
          state: z.string().min(2),
          postalCode: z.string().min(3),
          country: z.string().default('IN'),
        })
        .optional(),
      couponCode: z.string().optional(),
      items: z
        .array(
          z.object({
            variantId: z.string().uuid('Invalid variant ID'),
            quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
          }),
        )
        .optional(),
    })
    .refine((data) => data.addressId || data.shippingAddress, {
      message: 'Either addressId or shippingAddress must be provided',
      path: ['addressId'],
    }),
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string(), // can be UUID or orderNumber
  }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURN_REQUESTED',
        'RETURNED',
        'REFUNDED',
      ])
      .optional(),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      reason: z.string().max(300).optional(),
    })
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUNDED',
    ]),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>['query'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
