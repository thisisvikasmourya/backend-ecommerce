import { prisma } from '../../config/database.js';
import { Product, ProductVariant, ProductImage, Prisma } from '@prisma/client';
import { ProductListQuery } from './product.types.js';

export class ProductRepository {
  public async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        images: true,
      },
    });
  }

  public async findByIdOrSlug(identifier: string): Promise<any | null> {
    // Check if identifier is valid UUID or search by slug
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

    return prisma.product.findFirst({
      where: isUuid ? { OR: [{ id: identifier }, { slug: identifier }] } : { slug: identifier },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });
  }

  public async findMany(query: ProductListQuery): Promise<{ products: any[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    } else {
      where.isActive = true; // default to active for public queries
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = {
        OR: [{ id: query.category }, { slug: query.category }],
      };
    }

    if (query.brand) {
      where.brand = {
        OR: [{ id: query.brand }, { slug: query.brand }],
      };
    }

    const variantWhere: Prisma.ProductVariantWhereInput = {};
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      variantWhere.price = {};
      if (query.minPrice !== undefined) variantWhere.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) variantWhere.price.lte = query.maxPrice;
    }

    if (query.color) {
      variantWhere.color = { equals: query.color, mode: 'insensitive' };
    }

    if (query.size) {
      variantWhere.size = { equals: query.size, mode: 'insensitive' };
    }

    if (Object.keys(variantWhere).length > 0) {
      where.variants = { some: variantWhere };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              inventory: true,
            },
          },
          images: {
            orderBy: { isPrimary: 'desc' },
          },
          _count: {
            select: { reviews: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    // If sorting by price (variant level), sort in-memory
    if (query.sort === 'price_asc') {
      products.sort((a, b) => {
        const minA = Math.min(...a.variants.map((v: any) => Number(v.price)));
        const minB = Math.min(...b.variants.map((v: any) => Number(v.price)));
        return minA - minB;
      });
    } else if (query.sort === 'price_desc') {
      products.sort((a, b) => {
        const maxA = Math.max(...a.variants.map((v: any) => Number(v.price)));
        const maxB = Math.max(...b.variants.map((v: any) => Number(v.price)));
        return maxB - maxA;
      });
    }

    return { products, total };
  }

  public async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        variants: {
          include: { inventory: true },
        },
        images: true,
      },
    });
  }

  public async delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }

  public async findVariantById(variantId: string): Promise<ProductVariant | null> {
    return prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        inventory: true,
      },
    });
  }

  public async findVariantBySku(sku: string): Promise<ProductVariant | null> {
    return prisma.productVariant.findUnique({ where: { sku } });
  }

  public async createVariant(
    productId: string,
    data: Prisma.ProductVariantCreateWithoutProductInput,
    stock: number = 0,
  ): Promise<ProductVariant> {
    return prisma.productVariant.create({
      data: {
        ...data,
        product: { connect: { id: productId } },
        inventory: {
          create: {
            availableStock: stock,
            reservedStock: 0,
            soldStock: 0,
          },
        },
      },
      include: {
        inventory: true,
      },
    });
  }

  public async updateVariant(
    variantId: string,
    data: Prisma.ProductVariantUpdateInput,
  ): Promise<ProductVariant> {
    return prisma.productVariant.update({
      where: { id: variantId },
      data,
      include: {
        inventory: true,
      },
    });
  }

  public async deleteVariant(variantId: string): Promise<ProductVariant> {
    return prisma.productVariant.delete({ where: { id: variantId } });
  }

  public async addImage(
    productId: string,
    data: Prisma.ProductImageCreateWithoutProductInput,
  ): Promise<ProductImage> {
    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    return prisma.productImage.create({
      data: {
        ...data,
        product: { connect: { id: productId } },
      },
    });
  }

  public async deleteImage(imageId: string): Promise<ProductImage> {
    return prisma.productImage.delete({ where: { id: imageId } });
  }
}

export const productRepository = new ProductRepository();
