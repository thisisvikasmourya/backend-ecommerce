import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid UUID identifier format'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
