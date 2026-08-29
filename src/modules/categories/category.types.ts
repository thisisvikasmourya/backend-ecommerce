import { Category } from '@prisma/client';

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface CreateCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
}
