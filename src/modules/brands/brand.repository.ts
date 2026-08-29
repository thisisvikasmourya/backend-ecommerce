import { prisma } from '../../config/database.js';
import { Brand, Prisma } from '@prisma/client';

export class BrandRepository {
  public async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return prisma.brand.create({ data });
  }

  public async findById(id: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  public async findBySlug(slug: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  public async findByName(name: string): Promise<Brand | null> {
    return prisma.brand.findUnique({ where: { name } });
  }

  public async findAll(): Promise<Brand[]> {
    return prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Brand> {
    return prisma.brand.delete({ where: { id } });
  }
}

export const brandRepository = new BrandRepository();
