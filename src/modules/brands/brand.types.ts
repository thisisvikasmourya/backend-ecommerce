import { Brand } from '@prisma/client';

export interface CreateBrandDTO {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateBrandDTO {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

export type BrandResponse = Brand;
