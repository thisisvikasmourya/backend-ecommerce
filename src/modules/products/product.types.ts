import { Product, ProductVariant, ProductImage, Category, Brand } from '@prisma/client';

export interface ProductVariantWithInventory extends ProductVariant {
  inventory?: {
    availableStock: number;
    reservedStock: number;
    soldStock: number;
  } | null;
}

export interface ProductDetail extends Product {
  category: Category;
  brand: Brand | null;
  variants: ProductVariantWithInventory[];
  images: ProductImage[];
  _count?: {
    reviews: number;
  };
  averageRating?: number;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  isActive?: boolean;
}