import { z } from 'zod';

export const createReviewSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    rating: z.coerce
      .number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    title: z.string().max(100).optional(),
    comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    title: z.string().max(100).optional(),
    comment: z.string().min(5).max(1000).optional(),
  }),
});

export const getReviewsQuerySchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});

export const reviewParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
