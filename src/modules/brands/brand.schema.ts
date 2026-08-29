import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Brand name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url('Invalid logo URL').optional(),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid brand ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url('Invalid logo URL').optional(),
  }),
});

export const getBrandByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid brand ID'),
  }),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>['body'];
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>['body'];
