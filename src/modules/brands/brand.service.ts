import { brandRepository, BrandRepository } from './brand.repository.js';
import { CreateBrandInput, UpdateBrandInput } from './brand.schema.js';
import { Brand } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { slugify } from '../../common/utils/slug.js';

export class BrandService {
  constructor(private readonly repo: BrandRepository = brandRepository) {}

  public async getBrands(): Promise<Brand[]> {
    return this.repo.findAll();
  }

  public async getBrandById(id: string): Promise<Brand> {
    const brand = await this.repo.findById(id);
    if (!brand) {
      throw new NotFoundError('Brand not found', ErrorCodes.NOT_FOUND);
    }
    return brand;
  }

  public async getBrandBySlug(slug: string): Promise<Brand> {
    const brand = await this.repo.findBySlug(slug);
    if (!brand) {
      throw new NotFoundError('Brand not found', ErrorCodes.NOT_FOUND);
    }
    return brand;
  }

  public async createBrand(input: CreateBrandInput): Promise<Brand> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    const existingName = await this.repo.findByName(input.name);
    if (existingName) {
      throw new ConflictError('A brand with this name already exists', ErrorCodes.CONFLICT);
    }

    const existingSlug = await this.repo.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A brand with this slug already exists', ErrorCodes.CONFLICT);
    }

    return this.repo.create({
      name: input.name,
      slug,
      description: input.description,
      logoUrl: input.logoUrl,
    });
  }

  public async updateBrand(id: string, input: UpdateBrandInput): Promise<Brand> {
    await this.getBrandById(id);

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.slug !== undefined) {
      data.slug = slugify(input.slug);
    } else if (input.name !== undefined) {
      data.slug = slugify(input.name);
    }

    return this.repo.update(id, data);
  }

  public async deleteBrand(id: string): Promise<void> {
    await this.getBrandById(id);
    await this.repo.delete(id);
  }
}

export const brandService = new BrandService();
