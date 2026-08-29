import { z } from 'zod';

export const createProductVariantSchema = z.object({
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  price: z.coerce.number().positive('Price must be positive'),
  color: z.string().optional(),
  size: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).default(0),
});

export const updateProductVariantSchema = z.object({
  sku: z.string().min(2).max(50).optional(),
  price: z.coerce.number().positive().optional(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).optional(),
});

export const createProductImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(200),
    slug: z.string().min(2).max(200).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().uuid('Invalid category ID'),
    brandId: z.string().uuid('Invalid brand ID').optional().nullable(),
    isActive: z.boolean().default(true),
    variants: z.array(createProductVariantSchema).min(1, 'At least one variant is required'),
    images: z.array(createProductImageSchema).optional().default([]),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    slug: z.string().min(2).max(200).optional(),
    description: z.string().min(10).optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    brandId: z.string().uuid('Invalid brand ID').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string(), // can be id or slug
  }),
});

export const addVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: createProductVariantSchema,
});

export const updateVariantRouteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID'),
  }),
  body: updateProductVariantSchema,
});

export const addImageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: createProductImageSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type CreateVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateProductVariantSchema>;
export type CreateImageInput = z.infer<typeof createProductImageSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>['query'];
