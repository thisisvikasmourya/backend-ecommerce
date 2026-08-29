import { categoryRepository, CategoryRepository } from './category.repository.js';
import { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js';
import { Category } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { slugify } from '../../common/utils/slug.js';

export class CategoryService {
  constructor(private readonly repo: CategoryRepository = categoryRepository) {}

  public async getCategories(asTree: boolean = false): Promise<Category[]> {
    if (asTree) {
      return this.repo.findTree();
    }
    return this.repo.findAll();
  }

  public async getCategoryById(id: string): Promise<Category> {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found', ErrorCodes.NOT_FOUND);
    }
    return category;
  }

  public async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.repo.findBySlug(slug);
    if (!category) {
      throw new NotFoundError('Category not found', ErrorCodes.NOT_FOUND);
    }
    return category;
  }

  public async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    const existingName = await this.repo.findByName(input.name);
    if (existingName) {
      throw new ConflictError('A category with this name already exists', ErrorCodes.CONFLICT);
    }

    const existingSlug = await this.repo.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A category with this slug already exists', ErrorCodes.CONFLICT);
    }

    if (input.parentId) {
      const parent = await this.repo.findById(input.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category not found', ErrorCodes.NOT_FOUND);
      }
    }

    return this.repo.create({
      name: input.name,
      slug,
      description: input.description,
      parent: input.parentId ? { connect: { id: input.parentId } } : undefined,
    });
  }

  public async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    await this.getCategoryById(id);

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.slug !== undefined) {
      data.slug = slugify(input.slug);
    } else if (input.name !== undefined) {
      data.slug = slugify(input.name);
    }

    if (input.parentId !== undefined) {
      if (input.parentId === null) {
        data.parent = { disconnect: true };
      } else {
        if (input.parentId === id) {
          throw new ConflictError('A category cannot be its own parent', ErrorCodes.BAD_REQUEST);
        }
        const parent = await this.repo.findById(input.parentId);
        if (!parent) {
          throw new NotFoundError('Parent category not found', ErrorCodes.NOT_FOUND);
        }
        data.parent = { connect: { id: input.parentId } };
      }
    }

    return this.repo.update(id, data);
  }

  public async deleteCategory(id: string): Promise<void> {
    await this.getCategoryById(id);
    await this.repo.delete(id);
  }
}

export const categoryService = new CategoryService();
