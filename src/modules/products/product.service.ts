import { productRepository, ProductRepository } from './product.repository.js';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  CreateImageInput,
  GetProductsQuery,
} from './product.schema.js';
import { NotFoundError, ConflictError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { slugify } from '../../common/utils/slug.js';
import { prisma } from '../../config/database.js';

export class ProductService {
  constructor(private readonly repo: ProductRepository = productRepository) {}

  public async getProducts(query: GetProductsQuery) {
    return this.repo.findMany(query);
  }

  public async getProductByIdOrSlug(idOrSlug: string) {
    const product = await this.repo.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw new NotFoundError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  public async createProduct(input: CreateProductInput) {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    const existingSlug = await this.repo.findByIdOrSlug(slug);
    if (existingSlug) {
      throw new ConflictError('A product with this slug already exists', ErrorCodes.CONFLICT);
    }

    // Verify all variant SKUs are unique
    for (const v of input.variants) {
      const existingSku = await this.repo.findVariantBySku(v.sku);
      if (existingSku) {
        throw new ConflictError(`Variant SKU '${v.sku}' already exists`, ErrorCodes.CONFLICT);
      }
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          category: { connect: { id: input.categoryId } },
          brand: input.brandId ? { connect: { id: input.brandId } } : undefined,
          isActive: input.isActive ?? true,
          variants: {
            create: input.variants.map((v) => ({
              sku: v.sku,
              price: v.price,
              color: v.color,
              size: v.size,
              weight: v.weight,
              inventory: {
                create: {
                  availableStock: v.stock,
                  reservedStock: 0,
                  soldStock: 0,
                },
              },
            })),
          },
          images: {
            create: input.images?.map((img) => ({
              url: img.url,
              altText: img.altText,
              isPrimary: img.isPrimary,
            })),
          },
        },
        include: {
          category: true,
          brand: true,
          variants: {
            include: { inventory: true },
          },
          images: true,
        },
      });

      return product;
    });
  }

  public async updateProduct(id: string, input: UpdateProductInput) {
    await this.getProductByIdOrSlug(id);

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
    if (input.brandId !== undefined) {
      data.brand = input.brandId ? { connect: { id: input.brandId } } : { disconnect: true };
    }
    if (input.slug !== undefined) {
      data.slug = slugify(input.slug);
    } else if (input.name !== undefined) {
      data.slug = slugify(input.name);
    }

    return this.repo.update(id, data);
  }

  public async deleteProduct(id: string) {
    await this.getProductByIdOrSlug(id);
    return this.repo.delete(id);
  }

  public async addVariant(productId: string, input: CreateVariantInput) {
    await this.getProductByIdOrSlug(productId);

    const existingSku = await this.repo.findVariantBySku(input.sku);
    if (existingSku) {
      throw new ConflictError(`Variant SKU '${input.sku}' already exists`, ErrorCodes.CONFLICT);
    }

    return this.repo.createVariant(
      productId,
      {
        sku: input.sku,
        price: input.price,
        color: input.color,
        size: input.size,
        weight: input.weight,
      },
      input.stock,
    );
  }

  public async updateVariant(variantId: string, input: UpdateVariantInput) {
    const variant = await this.repo.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Variant not found', ErrorCodes.VARIANT_NOT_FOUND);
    }

    if (input.sku && input.sku !== variant.sku) {
      const existingSku = await this.repo.findVariantBySku(input.sku);
      if (existingSku) {
        throw new ConflictError(`Variant SKU '${input.sku}' already exists`, ErrorCodes.CONFLICT);
      }
    }

    const data: any = {};
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.price !== undefined) data.price = input.price;
    if (input.color !== undefined) data.color = input.color;
    if (input.size !== undefined) data.size = input.size;
    if (input.weight !== undefined) data.weight = input.weight;

    if (input.stock !== undefined) {
      data.inventory = {
        update: {
          availableStock: input.stock,
        },
      };
    }

    return this.repo.updateVariant(variantId, data);
  }

  public async deleteVariant(variantId: string) {
    const variant = await this.repo.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Variant not found', ErrorCodes.VARIANT_NOT_FOUND);
    }
    return this.repo.deleteVariant(variantId);
  }

  public async addImage(productId: string, input: CreateImageInput) {
    await this.getProductByIdOrSlug(productId);
    return this.repo.addImage(productId, input);
  }

  public async deleteImage(imageId: string) {
    return this.repo.deleteImage(imageId);
  }
}

export const productService = new ProductService();
