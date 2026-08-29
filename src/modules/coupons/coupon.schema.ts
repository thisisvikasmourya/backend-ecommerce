import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3)
      .max(30)
      .transform((c) => c.toUpperCase().trim()),
    description: z.string().max(200).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.coerce.number().positive(),
    minOrderValue: z.coerce.number().positive().optional().nullable(),
    maxDiscount: z.coerce.number().positive().optional().nullable(),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    perUserLimit: z.coerce.number().int().positive().default(1),
    validFrom: z.coerce.date().default(() => new Date()),
    validUntil: z.coerce.date(),
    isActive: z.boolean().default(true),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid coupon ID'),
  }),
  body: z.object({
    code: z
      .string()
      .min(3)
      .max(30)
      .transform((c) => c.toUpperCase().trim())
      .optional(),
    description: z.string().max(200).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.coerce.number().positive().optional(),
    minOrderValue: z.coerce.number().positive().optional().nullable(),
    maxDiscount: z.coerce.number().positive().optional().nullable(),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    perUserLimit: z.coerce.number().int().positive().optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getCouponByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid coupon ID'),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    subtotal: z.coerce.number().positive(),
  }),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>['body'];
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>['body'];
