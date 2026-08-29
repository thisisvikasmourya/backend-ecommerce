import { prisma } from '../../config/database.js'

import { Product, Prisma } from '@prisma/client'

export class ProductRepository {
    public async create(data: Prisma.ProductCreateInput): Promise<Product> {
        return prisma.product.create({ data });
    }
    public async findById(id: string): Promise<Product | null> {
        return prisma.product.findUnique({ where: { id } });
    }
    public async updateById(id: string, data: Prisma.ProductUpdateInput): Promise<Product | null> {
        return prisma.product.update({ where: { id }, data });
    }
    public async deleteById(id: string): Promise<Product | null> {
        return prisma.product.delete({ where: { id } });
    }
}
export const productRepository = new ProductRepository()
