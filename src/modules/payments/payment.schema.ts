import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
    provider: z.string().default('STRIPE'),
    idempotencyKey: z.string().min(8).optional(),
  }),
});

export const getPaymentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
});

export const webhookPayloadSchema = z.object({
  body: z.object({
    event: z.string(),
    paymentId: z.string().uuid().optional(),
    orderId: z.string().optional(),
    transactionId: z.string().min(1),
    status: z.enum(['SUCCESS', 'FAILED']),
    amount: z.coerce.number().positive(),
  }),
});

export const refundPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
  body: z.object({
    reason: z.string().max(200).optional(),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type WebhookInput = z.infer<typeof webhookPayloadSchema>['body'];
