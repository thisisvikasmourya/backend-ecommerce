import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('IN'),
    isDefault: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    street: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    postalCode: z.string().min(1).optional(),
    country: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>['body'];
